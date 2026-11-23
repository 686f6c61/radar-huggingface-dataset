# thepatch/foundation-1-GGUF

## Resumen

Foundation-1 GGUF es la conversión al formato GGUF del modelo de generación de audio Foundation-1 (RoyalCities/Foundation-1), un ajuste fino completo sobre Stable Audio Open 1.0. La conversión la publica el usuario thepatch y está pensada para el runtime nativo de stable-audio-tools integrado en sa3.cpp, una implementación en C++/GGML que permite ejecutar el modelo sin depender de PyTorch. El modelo resuelve la generación de clips musicales cortos (4 u 8 compases) a partir de descripciones textuales, con control explícito de tempo y tonalidad.

Arquitectónicamente hereda la pila de Stable Audio Open 1.0: un codificador de texto T5-base, un autoencoder latente Oobleck y un transformer de difusión que opera en el espacio latente. El recuento de parámetros de los safetensors originales asciende a 1.057.335.680 (aproximadamente 1,06 mil millones), y el repositorio GGUF ocupa 5,8 GB en total, repartido entre cuatro niveles de cuantización más el codificador Oobleck separado para audio-a-audio.

Su relevancia actual radica en que acerca la generación musical de alta fidelidad a entornos de inferencia ligeros y portables (GGML, CUDA opcional) y en que documenta con métricas de fidelidad (coseno de envolvente y log-magnitud) el impacto de cada cuantización, algo poco habitual en modelos de audio. La licencia Stability AI Community condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Audio Open 1.0: T5-base (texto) + autoencoder latente Oobleck + transformer de difusión latente |
| Parámetros totales | 1.057.335.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por prompt de texto; clips de 4 u 8 compases) |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M; codificador Oobleck solo en F16 |
| Idiomas soportados | no disponible |
| Licencia | stability-ai-community (Stability AI Community License) |
| Formato de pesos | GGUF (safetensors en el modelo fuente) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Stable Audio Open 1.0 y conserva su misma arquitectura: codificador de texto T5-base (revisión `a9723ea7f1b39c1eae772870f3b547bf6ef7e6c1`), autoencoder latente Oobleck y un transformer de difusión que genera latentes de audio a partir del condicionamiento textual y de valores de condicionamiento como `seconds_total`. La generación sigue un muestreo de difusión: el perfil de la interfaz de RoyalCities emplea DPM++ 3M SDE con sigma 0.01–100, 100 pasos y CFG 7; el perfil alternativo gary4local usa DPM++ 2M SDE con sigma 0.5–50, 100 pasos y CFG 7.

El entrenamiento se orientó explícitamente a clips musicales de 4 u 8 compases en tempos de 100, 110, 120, 128, 130, 140 o 150 BPM; los BPM no soportados se rechazan de forma intencionada en el perfil de sa3.cpp. El prompt debe incluir el número de compases y el BPM elegidos. La conversión a GGUF aplica una puerta de fidelidad por tensor con coseno mínimo de 0.990, y los renders CUDA emparejados miden coseno de envolvente/log-magnitud de 0.9967/0.9901 en Q8, 0.9904/0.9550 en Q5 y 0.9643/0.9284 en Q4. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de audio musical a partir de texto (text-to-audio) en clips de 4 u 8 compases.
- Control explícito de tempo (100, 110, 120, 128, 130, 140, 150 BPM) y de tonalidad (key).
- Control de familia de instrumento o sonido (por ejemplo, `--family Synth` para fijar el ancla).
- Prompts estructurados: modo `--randomize` con vocabulario M1 de RoyalCities y variante más rica `mix` (T1).
- Audio-a-audio: el codificador Oobleck (`stable-audio-open-oobleck-encoder-v1.0-F16.gguf`) convierte audio de entrada en el latente inicial del muestreo.
- Selección de sampler por perfil (`--foundation-profile gary` para A/B con el fallback gary4local).
- Reproducibilidad mediante semilla (`--seed`), con impresión del prompt exacto, semilla, tonalidad y geometría musical.
- Estiramiento de tempo con preservación de tono a nivel de servicio en `sat-server` (mapea `host_bpm` al BPM entrenado más cercano).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada en lenguaje natural más allá del audio-a-audio.

## Casos de uso

- Producción musical asistida: generar loops de 4 u 8 compases a un BPM y tonalidad concretos para integrarlos en una sesión DAW, aprovechando el control determinista de tempo y key y la reproducibilidad por semilla.
- Diseño de sonido para videojuegos: crear variaciones de una familia de instrumento fija (`--family`) con el modo `--randomize` para poblar bancos de assets con coherencia tímbrica.
- Prototipado rápido de bandas sonoras: iterar sobre prompts estructurados con el perfil DPM++ 3M SDE a 100 pasos y CFG 7 para obtener borradores de alta fidelidad antes de una producción final.
- Remezcla y transformación de audio: usar la ruta audio-a-audio con el codificador Oobleck para partir de material existente y regenerarlo con el decoder Foundation-1.
- Ajuste de tempo en postproducción: desplegar `sat-server` y emplear `host_bpm` para adaptar clips generados al tempo del proyecto con preservación de tono.
- Despliegue en entornos sin PyTorch: ejecutar el modelo vía sa3.cpp con GGML y CUDA opcional en máquinas donde instalar el stack de Python no es viable, usando los tiers Q4/Q5 para minimizar huella.
- Evaluación comparativa de cuantizaciones: emplear los tres tiers cuantizados y las métricas de coseno publicadas para decidir el equilibrio fidelidad/tamaño en un pipeline concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Sí se publican métricas de fidelidad de la conversión GGUF respecto al modelo de referencia:

| Tier | Bundle completo | Coseno envolvente (CUDA) | Coseno log-magnitud (CUDA) | Guía |
|---|---:|---:|---:|---|
| F16 | 2.377 MiB | referencia | referencia | Referencia y valor por defecto del runtime |
| Q8_0 | 1.296 MiB | 0.9967 | 0.9901 | Alta fidelidad conservadora |
| Q5_K_M | 922 MiB | 0.9904 | 0.9550 | Tier compacto recomendado |
| Q4_K_M | 832 MiB | 0.9643 | 0.9284 | Menor huella |

Todos los tensores cuantizados superaron la puerta de coseno 0.990 por tensor y los cuatro tiers pasaron pruebas de escucha.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el bundle completo ocupa entre 832 MiB (Q4_K_M) y 2.377 MiB (F16) en disco, más 149 MiB del codificador Oobleck F16 si se usa audio-a-audio, a lo que hay que sumar la memoria del runtime y de los latentes.
- GPU recomendadas: no se especifican modelos concretos; el runtime soporta CUDA (`-DSA3_CUDA=ON`, `SA3_DEVICE=cuda`).
- GPU de consumo: por tamaño de los pesos, los tiers Q4/Q5 son compatibles con GPUs de consumo con suficiente VRAM libre, aunque el autor no publica requisitos mínimos verificados.
- Opciones de despliegue: sa3.cpp (CLI `sat-generate` y servidor `sat-server` con endpoints como `POST /audio2audio`), compilado con CMake; runtime nativo de stable-audio-tools.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Foundation-1 GGUF (este) | 1.057.335.680 | Clips de 4 u 8 compases; BPM entrenados 100–150 | GGUF | stability-ai-community | Cuantizaciones Q4–F16, runtime C++/GGML |
| Stable Audio Open 1.0 | no disponible en la información | no disponible | safetensors | stability-ai-community | Modelo base del que deriva Foundation-1 |
| Stable Audio Open Small | no disponible en la información | no disponible | no disponible | no disponible | Comparte los 146 tensores del codificador Oobleck según la model card |
| RoyalCities/Foundation-1 | 1.057.335.680 (fuente) | Igual que este modelo | safetensors | stability-ai-community | Modelo original en PyTorch |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Restricción de tempo: solo se admiten los BPM entrenados (100, 110, 120, 128, 130, 140, 150); otros valores se rechazan de forma intencionada en el perfil de sa3.cpp.
- Duración limitada: el modelo está entrenado para clips de 4 u 8 compases, no para piezas largas.
- Licencia: Stability AI Community License, con condiciones específicas para uso comercial; es necesario revisar `LICENSE.md` antes de desplegar en producción.
- El codificador Oobleck para audio-a-audio es un archivo separado y solo existe en F16; la generación texto-a-audio no lo carga.
- La fidelidad de las cuantizaciones decae de forma medible: Q4_K_M baja a 0.9643 de coseno de envolvente y 0.9284 de log-magnitud, lo que puede ser perceptible en material exigente.
- Idiomas soportados no documentados; el condicionamiento textual depende de T5-base, pero no se especifica cobertura multilingüe.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinación o artefactos en la generación.
- El modelo fuente es un ajuste fino de terceros (RoyalCities) sobre Stable Audio Open 1.0; la calidad final depende de ese ajuste y no está avalada por benchmarks públicos.
- Repositorio con 445 descargas y 0 likes en el momento de la consulta: ecosistema pequeño y poca validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/thepatch/foundation-1-GGUF
- Modelo fuente: https://huggingface.co/RoyalCities/Foundation-1
- Runtime sa3.cpp: https://github.com/betweentwomidnights/sa3.cpp
- Documentación del servidor SAT: https://github.com/betweentwomidnights/sa3.cpp/blob/main/docs/SAT_SERVER.md
- Stable Audio Open 1.0 (base): https://huggingface.co/stabilityai/stable-audio-open-1.0
- Licencia Stability AI Community: https://huggingface.co/stabilityai/stable-audio-open-1.0/blob/main/LICENSE.md
- T5-base: https://huggingface.co/google-t5/t5-base
