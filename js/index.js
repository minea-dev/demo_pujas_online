import { createApp } from './vue.esm-browser.js'

const supabaseUrl = 'https://gipktveldlohfosrbqjm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcGt0dmVsZGxvaGZvc3JicWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYxNzE2OTUsImV4cCI6MTk2MTc0NzY5NX0.4T-DZUymImCk50XCSexIbLNB1QrwirED9awxeT0FA4g'

const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcGt0dmVsZGxvaGZvc3JicWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYxNzE2OTUsImV4cCI6MTk2MTc0NzY5NX0.4T-DZUymImCk50XCSexIbLNB1QrwirED9awxeT0FA4g'
};

const cli = supabase.createClient(supabaseUrl, supabaseKey)

createApp({
    data() {
        return {
            numeros: [],
            nombre: '',
            nuevaPuja: '',
            ganador: '',
            pujaEnProceso: false
        }
    },
    methods: {
        cargarNumeros: async function() {
            let { data: data, error } = await cli
                .from('Pujas')
                .select('*')
                .order('created_at', { ascending: true })
                // Ordenar
            this.numeros = data;
        },
        enviarPuja: async function() {
            if (this.numeros[this.numeros.length - 1].puja < this.nuevaPuja) {
                const { data, error } = await cli.from('Pujas').insert([{ nombre: this.nombre, puja: this.nuevaPuja }])
                    // Limpiamos el mensaje
                this.nuevaPuja = '';
            }
        },
        escucharNuevasPujas: function() {
            // Esta función actualiza directamente la parte del chat
            cli
                .from('Pujas')
                .on('INSERT', payload => {
                    // Añado mensaje nuevo
                    this.numeros.push(payload.new);
                })
                .subscribe()
        },
        empezarPuja: function() {
            this.pujaEnProceso = true;
            setTimeout(() => {
                this.pujaEnProceso = false;
                this.ganador = this.numeros[this.numeros.length - 1].nombre;
                //deletePujas();
                console.log('El ganador es ' + this.ganador)
            }, 10000);
        },
        /* deletePujas: async function() {
             numeros.filter(numero => {
                 await fetch(`${supabaseUrl}/rest/v1/Pujas?id=eq.${numero.id}`, {
                     headers: headers,
                     method: 'DELETE'
                 });
             })

         } */
    },
    mounted() {
        this.cargarNumeros();
        this.escucharNuevasPujas();
        if (localStorage.nombre) {
            this.nombre = localStorage.nombre;
        }
    },
    watch: {
        mensajes: {
            handler(newValue, oldValue) {
                // Desciendo el scroll
                this.$nextTick(() => {
                    const elemento = this.$refs.mensajesContenedor;
                    elemento.scrollTo(0, elemento.scrollHeight);
                })
            },
            deep: true
        },
        nombre(nuevoNombre) {
            localStorage.nombre = nuevoNombre;
        }
    }
}).mount('#app')