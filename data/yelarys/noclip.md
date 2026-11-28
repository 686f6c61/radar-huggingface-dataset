# yelarys/noclip

## Resumen

noclip es un modelo neuronal de mundo ("world model") desarrollado por el autor independiente yelarys que genera, fotograma a fotograma, la vista en primera persona de un videojuego de los Backrooms. No se trata de un modelo de lenguaje: es un transformer causal de 211 millones de parametros que, a partir de las pulsaciones de teclado y el movimiento del raton, dibuja la siguiente imagen del juego a 10 fotogramas por segundo en tiempo real sobre una unica GPU. Detras de la imagen no hay mapa ni motor de juego: el modelo inventa cada fotograma apoyandose solo en su contexto visual reciente.

El modelo se entreno desde cero exclusivamente sobre un simulador procedural de 18 niveles de los Backrooms, sin datos externos, y se juega sin ese simulador. Arquitectonicamente combina un transformer causal sobre latentes de un autoencoder DC-AE (con downsample de 32x) con un decodificador de imagenes afinado, y se entrena mediante flow matching con teacher forcing sobre contexto ligeramente ruidoso.

Su relevancia reside en que demuestra un world model jugable en tiempo real con requisitos de hardware modestos (unos 3,1 GB de VRAM en juego y 47 ms por fotograma con 12 pasos de muestreo en una RTX 5000 Ada), lo que lo convierte en una referencia practica para investigacion en modelos de mundo, generacion de video interactiva y agentes que aprenden entornos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre latentes DC-AE (32x downsampling), atencion factorizada (intra-fotograma y entre fotogramas en la misma posicion); anchura 768, 16 capas, 12 cabezas |
| Parametros totales | 210.608.672 (modelo de mundo, float32); el repositorio incluye ademas decoder (1,07 GB), encoder (245 MB) y events (0,4 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24 fotogramas de 512x288 a 10 fps (2,4 s) mas hasta 8 fotogramas de memoria recuperados por pose |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; genera imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, decoder.safetensors, encoder.safetensors, events.safetensors) |

## Arquitectura y entrenamiento

El nucleo es un transformer causal que opera sobre los latentes 16x9x32 de los ultimos 24 fotogramas de video 512x288 a 10 fps, codificados con un autoencoder DC-AE de 32x de downsample. La atencion esta factorizada en dos ejes: dentro de cada fotograma y entre fotogramas en la misma posicion espacial, lo que reduce el coste computacional del contexto temporal. Cada fotograma se condiciona con 11 columnas de accion (movimiento, desplazamiento lateral, giro, cabeceo, sprint, linterna, noclip, uso y tres columnas de estado) y con el nivel actual. Ademas, se incorporan hasta 8 fotogramas de memoria recuperados por pose de momentos anteriores del sueno.

El entrenamiento se realizo desde cero unicamente sobre el simulador del repositorio, con aproximadamente 123 millones de fotogramas en tres etapas (53M, 40M y 30M) mientras el simulador crecia de 12 a 18 niveles; la ultima etapa muestreo ventanas de 16 millones de fotogramas (440 horas de juego guionizado). Se empleo flow matching con teacher forcing sobre contexto ligeramente ruidoso y, en la mitad de los lotes, el contexto era la propia estimacion de una pasada del modelo, lo que evita la deriva inmediata del sueno. El muestreo usa 12 pasos de un integrador de segundo orden (Adams-Bashforth) por fotograma, sin guidance. Los pesos publicados son una media movil de las rondas de entrenamiento, y el computo requirio entre 6 y 11 GPUs RTX 5000 Ada durante dos dias.

## Capacidades

- Generacion interactiva de video en primera persona a 10 fps en tiempo real, condicionada por teclado y raton.
- Control de movimiento (caminar, correr), vision (giro y cabeceo), linterna y cambio de nivel ("noclip").
- Generacion de escenas procedurales coherentes durante decenas de segundos por nivel, con memoria de lugares a corto plazo.
- Representacion implicita de un mundo sin mapa ni motor: el modelo sintetiza geometria, texturas e iluminacion de forma consistente.
- Deteccion de eventos de golpes y muertes a partir de los latentes (events.safetensors) para sincronizar sonido.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; no es un modelo de lenguaje.
- No dispone de capacidades multilingues, vision general, audio ni modo de pensamiento.

## Casos de uso

- Investigacion en world models: permite estudiar como un transformer aprende dinamica de entornos y mantiene coherencia temporal sin un motor fisico, con un coste de hardware accesible.
- Generacion de video interactiva en tiempo real: util para prototipar experiencias jugables generativas donde el usuario controla la camara y el modelo dibuja el entorno al instante.
- Simulacion de entornos para agentes de refuerzo: el modelo puede actuar como entorno sintetico ligero para entrenar o evaluar politicas de navegacion y exploracion.
- Demostraciones de investigacion y divulgacion: el servidor de juego incluido permite reproducir el modelo en local con una GPU de consumo y mostrar resultados de forma inmediata.
- Estudio de tecnicas de muestreo eficiente: con 12 pasos de Adams-Bashforth y 47 ms por fotograma, sirve como banco de pruebas para comparar integradores y estrategias de contexto.
- Generacion de material audiovisual tematico: combinado con el lector de eventos, permite producir clips con sonido sincronizado de forma automatica a partir de partidas grabadas.
- Base para fine-tuning en otros entornos simulados: al estar liberado en Apache 2.0 y con el simulador disponible, se puede reentrenar sobre otros juegos o escenarios procedurales.

## Benchmarks y rendimiento

Los datos medidos por el autor corresponden a una reproduccion sin control humano: se muestran 8 fotogramas grabados del simulador y despues solo las pulsaciones registradas, comparando cada fotograma generado con el del simulador para el mismo instante (96 episodios, 12 pasos de muestreo).

| Metrica | Resultado |
|---|---|
| Similitud con el simulador en el primer segundo (PSNR) | 26,7 dB (30 dB se considera casi identico) |
| Similitud doce segundos despues (PSNR) | 17,3 dB (dibuja habitaciones propias, no las del simulador) |
| Fotogramas en blanco entre 9 y 12 s (pared lisa, niebla, oscuridad) | 48% (el simulador: 12%) |
| Tiempo por fotograma en RTX 5000 Ada, 12 pasos | 47 ms (el juego admite 100 ms) |
| Memoria de GPU durante el juego | 3,1 GB |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,1 GB de GPU durante el juego segun el autor; se recomienda disponer de al menos 4 GB libres.
- GPU recomendadas: RTX 5000 Ada (medicion oficial); cualquier GPU NVIDIA con 4 GB o mas de memoria libre deberia ser suficiente, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 4 GB o mas de VRAM (por ejemplo, gama RTX 30/40 con 8 GB), aunque no hay datos oficiales de rendimiento en ellas.
- Opciones de despliegue: servidor de juego propio del repositorio (`python -m wm.play`) con PyTorch 2.8 y CUDA 12.8 en Windows; en Linux basta con `pip install -r requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 47 ms por fotograma con 12 pasos en RTX 5000 Ada, equivalente a unos 21 fps de capacidad de generacion frente a los 10 fps objetivo del juego.
- Requisitos de software: Python 3.10 o superior; en Windows no esta probado y requiere instalar PyTorch con el indice CUDA correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| noclip (yelarys) | 211M | 24 fotogramas + 8 de memoria | World model interactivo, flow matching, DC-AE | Apache 2.0 | Hugging Face + GitHub |
| Genie / Genie 2 (DeepMind) | no disponible | no disponible | World models generativos jugables | no disponible (no abierto) | No publico |
| GameNGen (Google) | no disponible | no disponible | Difusion para DOOM jugable | no disponible | Paper, sin pesos abiertos |
| Oasis (Decart) | no disponible | no disponible | World model de Minecraft jugable | no disponible | Demo cerrada |

No se dispone de datos publicos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. noclip destaca por ser el unico de la lista con pesos y codigo abiertos bajo Apache 2.0 y con requisitos de hardware de consumo.

## Limitaciones y advertencias

- Coherencia temporal limitada: un nivel se mantiene como lugar durante decenas de segundos; cuando la imagen se disuelve, el servidor de juego reubica al jugador en otro nivel.
- Control fiable solo de caminar y mirar; las puertas y entidades aparecen, pero no de forma fiable bajo peticion.
- Memoria de lugares a corto plazo: recuerda momentos, no recorridos largos.
- Reproduce la estetica de su simulador: 512x288, 10 fps y texturas procedurales; no generaliza a otros dominios visuales.
- No evaluado fuera de su propio simulador, por lo que su rendimiento en otros entornos es desconocido.
- Riesgo de deriva y fotogramas en blanco: el 48% de fotogramas entre 9 y 12 s son paredes lisas, niebla u oscuridad, frente al 12% del simulador.
- No es un modelo de lenguaje: no soporta tool calling, agentes conversacionales ni tareas de razonamiento textual.
- Licencia Apache 2.0 permite uso comercial, pero el decodificador es una copia modificada del decoder de DC-AE-lite de MIT HAN Lab y NVIDIA, cuyos terminos deben respetarse; el encoder se descarga de su repositorio original.
- Windows no esta probado oficialmente y requiere pasos manuales para habilitar CUDA en PyTorch.
- Proyecto no afiliado a ninguna pelicula, juego o wiki de los Backrooms; los nombres de niveles provienen de wikis comunitarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yelarys/noclip
- Codigo, simulador, entrenamiento y servidor de juego: https://github.com/Yelar/noclip
- Actualizaciones del autor en X: https://x.com/yelaryss
- Paper del autoencoder DC-AE (arXiv:2410.10733): https://arxiv.org/abs/2410.10733
- Decoder base DC-AE-lite de MIT HAN Lab: https://huggingface.co/mit-han-lab/dc-ae-lite-f32c32-sana-1.1-diffusers
- Video de demostracion: https://huggingface.co/yelarys/noclip/resolve/main/demo.mp4
