# Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed

## Resumen

Inkling 2 Mini Optimized Speed es un empaquetado cuantizado del modelo Inkling-2-Mini de Thinking Machines Lab, distribuido por el usuario Youssofal para su ejecucion local en Macs con Apple Silicon mediante MTPLX, una aplicacion y CLI para modelos locales en macOS. El modelo base es un transformer de tipo Mixture of Experts (MoE) orientado a codigo, agentes e imagenes, con 26.400 millones de parametros totales y 3.400 millones activos por token, y una ventana de contexto de hasta 1.048.576 tokens segun la model card del modelo base.

Este pack concreto pesa 17,2 GB en descarga y combina expertos en NVFP4 (los 24 capas), proyecciones de atencion y cabeza de salida en 8 bits con grupos de 64, embedding y torre de vision en BF16, y una cabeza de borrador (draft head) tambien en BF16 para decodificacion especulativa. La innovacion principal es el uso de multi-token prediction nativo del modelo para acelerar la generacion manteniendo la distribucion original de salida mediante la regla de aceptacion por cociente de probabilidades.

Es relevante porque demuestra que un MoE de 26B con vision y contexto de 1M puede ejecutarse en hardware de consumo Apple (M3, M4, M5 con 32 GB o mas), con un pico de memoria medido de 19,5 GiB sirviendo un prompt de 4.142 tokens en un MacBook Pro M5 Max. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque conviene revisar la politica de uso aceptable de Thinking Machines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con torre de vision y cabeza de borrador para multi-token prediction |
| Parametros totales | 27.530.496.048 (segun safetensors); la model card del pack cita 26.4B para el modelo base |
| Parametros activos | 3.4B por token (8 de 128 expertos activos, 24 capas) |
| Longitud de contexto | Hasta 1.048.576 tokens en el modelo base; el pack limita segun memoria (135.168 tokens con 32 GB, 1.048.576 tokens con 96 GB o mas) |
| Tipos de cuantizacion | Expertos NVFP4, atencion y cabeza de salida 8-bit (grupos de 64), embedding BF16, torre de vision BF16, draft head BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con politica de uso aceptable de Thinking Machines) |
| Formato de pesos | safetensors (formato MTPLX para Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 128 expertos por capa, de los cuales se activan 8 por token, repartidos en 24 capas. Incorpora una torre de vision completa que permite entrada image-text-to-text, y una cabeza de borrador (draft head) que implementa multi-token prediction: el modelo propone varios tokens por adelantado y el modelo completo los verifica en una sola pasada. La aceptacion se realiza mediante la regla del cociente de probabilidades, lo que garantiza que la salida siga la distribucion original del modelo a cualquier temperatura.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El pack de Youssofal no reentrena el modelo: solo modifica la precision de los pesos respecto al modelo original, tal y como declara el autor ("This pack changes only the precision listed under How it is built").

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo, orientado explicitamente a tareas de programacion.
- Capacidades de agente y razonamiento multi-paso (etiquetas "agents", "coding").
- Vision: lectura de capturas de pantalla, diagramas y fotografias mediante la torre de vision BF16 incluida.
- Entrada image-text-to-text (pipeline declarado en Hugging Face).
- Decodificacion especulativa con multi-token prediction para acelerar la inferencia.
- Servido mediante APIs compatibles con OpenAI y Anthropic a traves de `mtplx serve`.
- Integracion con clientes como Pi, OpenCode y Hermes mediante `mtplx start`.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion local en Mac: el modelo puede integrarse en OpenCode o Hermes mediante `mtplx start opencode` para autocompletar, refactorizar y explicar codigo sin enviar datos a la nube, aprovechando sus 3.4B parametros activos para latencia baja.
- Analisis de capturas de pantalla y diagramas: la torre de vision BF16 permite introducir imagenes de interfaces, diagramas de arquitectura o fotografias y obtener descripciones o codigo a partir de ellas, util para documentacion tecnica.
- Agentes autonomos multi-paso: con contexto de hasta 1.048.576 tokens en equipos de 96 GB o mas, puede mantener historiales largos de herramientas, resultados intermedios y trazas de ejecucion en tareas de agente.
- Procesamiento de repositorios completos: la ventana de contexto extendida permite cargar varios ficheros de codigo simultaneamente para tareas de revision, busqueda de bugs o generacion de tests.
- Desarrollo offline en entornos con restricciones de privacidad: al ejecutarse localmente en Apple Silicon con MTPLX, los datos no salen del equipo, adecuado para codigo propietario o datos sensibles.
- Prototipado rapido de asistentes conversacionales: el servidor local expone APIs compatibles con OpenAI y Anthropic en `127.0.0.1:8000`, lo que permite conectar frameworks existentes sin modificar el codigo cliente.
- Educacion e investigacion en Mac: investigadores pueden experimentar con un MoE de 26B y vision en hardware de consumo, sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son operativos: pico de memoria de 19,5 GiB sirviendo un prompt de 4.142 tokens en un MacBook Pro M5 Max, y tamano de descarga de 17,2 GB. No se indican tokens por segundo ni latencias.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico medido de 19,5 GiB con prompt de 4.142 tokens en M5 Max; requiere al menos 32 GB de memoria unificada para este pack.
- Equipos compatibles: Mac con M3, M4 o M5 y 32 GB o mas (desde MacBook Air hasta Mac Studio). Macs M1 y M2 con 32 GB o mas deben usar la build FP16.
- No cabe en equipos de 8, 16, 18 o 24 GB: MTPLX recomienda alternativas (Qwen 3.5 4B, Bonsai 2 27B, o el pack Bare Speed en 24 GB).
- Contexto maximo por memoria: 135.168 tokens con 32 GB, 212.992 con 36 GB, 405.504 con 48 GB, 716.800 con 64 GB y 1.048.576 con 96-512 GB.
- Opciones de despliegue: aplicacion MTPLX para macOS, CLI `mtplx` (instalable via Homebrew o pip), y servidor local con APIs OpenAI y Anthropic mediante `mtplx serve`.
- Requiere MTPLX 2.13 o superior; no carga en MTPLX 2.12.
- Latencia y throughput: no disponibles mas alla del dato de memoria pico.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini Optimized Speed (este pack) | 26.4B (27.5B en safetensors) | 3.4B | Hasta 1.048.576 tokens | Apache 2.0 | Hugging Face, MTPLX para Apple Silicon |
| Inkling 2 Mini Bare Speed | 26.4B | 3.4B | Hasta 1.048.576 tokens | Apache 2.0 | Hugging Face, MTPLX (16 GB de descarga) |
| Inkling 2 Mini Optimized Quality | 26.4B | 3.4B | Hasta 1.048.576 tokens | Apache 2.0 | Hugging Face, MTPLX |
| Qwen 3.5 4B Optimized Speed | No disponible | No disponible | No disponible | No disponible | Recomendado por MTPLX para Macs de 8 GB |

Los packs hermanos del mismo autor difieren solo en la precision de los pesos: Bare Speed ocupa 16 GB y Optimized Speed 17,2 GB (1,2 GB mas) por usar atencion y cabeza de salida en 8 bits en lugar de una cuantizacion mas agresiva. No se dispone de datos de benchmarks para comparar el rendimiento cualitativo entre ellos.

## Limitaciones y advertencias

- El pack solo funciona en MTPLX 2.13 o superior; no carga en versiones anteriores.
- Requiere hardware Apple Silicon especifico: no es desplegable en GPUs NVIDIA, AMD ni en Linux/Windows mediante este formato.
- El contexto maximo efectivo depende de la memoria del equipo, muy inferior a 1M en configuraciones de 32 GB (135.168 tokens).
- La cuantizacion NVFP4 de los expertos y 8-bit en atencion y cabeza de salida puede introducir degradacion respecto a los pesos originales, aunque el autor afirma mantenerse "mas cerca del original" que Bare Speed.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de alucinacion del modelo base.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base esta sujeto a la politica de uso aceptable de Thinking Machines, que conviene revisar antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del pack.
- La temperatura de muestreo recomendada es 1.0 con top-p 1.0 y sin top-k; desviarse puede afectar a la calidad.

## Enlaces

- Hugging Face del pack: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MTPLX: https://mtplx.com
- Pack hermano Bare Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Pack hermano Optimized Quality: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality
- Bare Speed FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16
- Optimized Speed FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16
- Optimized Quality FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Politica de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
