# tensorfiend/TuneLM-LFM3-1.7B-code2music-2011

## Resumen

TuneLM-LFM3-1.7B-code2music-2011 es un ajuste fino del modelo LiquidAI/LFM3-1.7B especializado en la generación de código musical ejecutable en Strudel, un entorno de live coding basado en JavaScript. Dado un enunciado en lenguaje natural que describe una pieza musical (tempo, tonalidad, instrumentación, estilo), el modelo devuelve un bloque de notas de composición y un programa JavaScript completo que un runtime de Strudel puede reproducir como audio. Lo desarrolla el usuario tensorfiend en el contexto del proyecto TuneLM.

El modelo parte de una arquitectura LFM3 de Liquid AI con 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) y un presupuesto de contexto de 6.144 tokens, con hasta 3.072 tokens nuevos de generación. Se ha entrenado en tres fases: SFT inicial, continuación de SFT con datos de Song Describer y una fase de GRPO (optimización por preferencias con recompensa verificable) sobre programas ejecutables. La adaptación se realizó con LoRA de rango 16, fusionada posteriormente en los pesos completos.

Su relevancia radica en que aborda una tarea poco habitual (code2music) con un enfoque de recompensa verificable: el modelo no solo debe sonar plausible, sino producir código que compile y se reproduzca. El checkpoint publicado corresponde al paso 250 del entrenamiento GRPO y reporta un 93,75 % de respuestas ejecutables sobre un monitor de validación fijo de 48 prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only LFM3 (implementación custom, requiere trust_remote_code) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 6.144 tokens (presupuesto de contexto de TuneLM) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | lfm-open-license-v1.0 (license: other) |
| Formato de pesos | safetensors, bfloat16 |

## Arquitectura y entrenamiento

El modelo se basa en LFM3-1.7B de Liquid AI, un transformer decoder-only de 1,7 mil millones de parámetros. Sobre esa base se aplicó una adaptación LoRA de rango 16 en dos fases de SFT: la primera con 2.016 ejemplos de entrenamiento y 200 de validación, y una segunda con 510 ejemplos aceptados de Song Describer y 50 de validación. Los programas Strudel y las notas de composición fueron generados por profesores Gemini, y el conjunto supervisado se publica como el dataset `tensorfiend/code2music`.

La tercera fase empleó GRPO partiendo del modelo SFT fusionado, con 1.764 peticiones de entrenamiento independientes, cuatro respuestas muestreadas por petición y una recompensa que verificaba la ejecutabilidad del programa, el cumplimiento de restricciones musicales comprobables, la coherencia entre notas y código, y penalizaba finalizaciones cercanas al límite. Los hiperparámetros registrados son learning rate 5e-6, temperatura 0,8, coeficiente KL 0,02 y límite de 3.072 tokens de finalización. El checkpoint publicado es el guardado en el paso 250 del optimizador. El modelo emplea un formato de salida estructurado con un bloque `<think>` de notas de composición seguido de un bloque de código `strudel` delimitado.

## Capacidades

- Generación de código Strudel ejecutable a partir de descripciones musicales en lenguaje natural.
- Producción de notas de composición razonadas en un bloque `<think>` antes del código.
- Control de parámetros musicales: tempo (mediante `setcpm(BPM/4)`), tonalidad, instrumentación y estructura (patrones, `stack`, `arrange`).
- Cumplimiento de restricciones de seguridad del runtime: sin imports, sin acceso a red, sin APIs de navegador, sin bucles ni llamadas a `samples()`.
- Modo de pensamiento activable mediante `enable_thinking=True` en la plantilla de chat.
- Uso de sonidos registrados del entorno Strudel.
- Capacidad de reparación de código cuando la compilación o el renderizado fallan (gestionada por la aplicación TuneLM, no de forma autónoma por el modelo).
- Soporte de conversación multi-turno mediante plantilla de chat.
- No se documentan capacidades de tool calling, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Composición asistida en live coding: un músico describe una idea ("groove a 120 BPM en do menor con batería y bajo suave") y obtiene un programa Strudel listo para ejecutar y editar manualmente en el editor.
- Educación musical y de programación: el bloque `<think>` expone las decisiones compositivas, lo que permite usar el modelo como herramienta didáctica para explicar patrones rítmicos y armonía junto al código resultante.
- Prototipado rápido de ideas musicales: generar variantes de un mismo concepto cambiando tempo, tonalidad o instrumentación para explorar alternativas antes de una sesión de producción.
- Generación de bandas sonoras para prototipos de juegos o aplicaciones: integración del código generado en un runtime Strudel embebido para producir audio procedural en el navegador.
- Creación de datasets musicales sintéticos: uso del modelo para generar pares descripción-código a escala, que pueden servir para entrenar o evaluar otros sistemas code2music.
- Herramientas de accesibilidad musical: permitir a personas sin conocimientos de programación describir en lenguaje natural la música que quieren y obtener código editable y reproducible.
- Integración en pipelines de generación de contenido: dado su tamaño de 1,7 B y su contexto de 6.144 tokens, puede desplegarse en infraestructura modesta para generar contenido musical bajo demanda.

## Benchmarks y rendimiento

Evaluación sobre el monitor de validación fijo de 48 prompts (selección de checkpoint):

| Metrica | Valor |
|---|---|
| Respuestas ejecutables | 45/48 (93,75 %) |
| Contract score medio | 0,7772 |
| Base reward medio | 0,7697 |

Evaluación de audio sobre los primeros diez segundos de clips guardados con 103 prompts compartidos de MusicPrefs (CLAP mayor es mejor; FAD, FAD-CLAP y MAD menor es mejor):

| Checkpoint | CLAP ↑ | FAD ↓ | FAD-CLAP ↓ | MAD ↓ |
|---|---:|---:|---:|---:|
| Song Describer SFT | 0,2559 | 5,4116 | 0,4645 | 2,2908 |
| GRPO step 250 | 0,2765 | 5,3979 | 0,4547 | 1,2422 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se ha realizado un estudio de preferencia humana para TuneLM.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 3,5 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 6.144 tokens se recomienda al menos 6-8 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en bfloat16; con cuantización a 8 bits o 4 bits (no documentada oficialmente) cabría en GPUs de 6 GB o menos.
- Opciones de despliegue: Transformers 5.20.2 con `trust_remote_code=True` (requisito de la implementación custom de LFM3), `accelerate` y `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la implementación custom puede limitar la compatibilidad con estos motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TuneLM-LFM3-1.7B-code2music-2011 | 1,73 B | 6.144 | Descripción musical a Strudel | lfm-open-license-v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | Generación de texto general | lfm-open-license-v1.0 | Hugging Face |
| Modelos code2music alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos especializados en code2music con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; las descripciones en otros idiomas pueden degradar la calidad del código generado.
- Riesgo de alucinación en nombres de sonidos, funciones de Strudel o parámetros musicales no registrados; el código debe validarse en un runtime Strudel antes de su reproducción.
- El código generado puede compilar pero no cumplir las restricciones musicales solicitadas; la aplicación TuneLM incluye un verificador y un mecanismo de reparación que el modelo por sí solo no garantiza.
- La licencia lfm-open-license-v1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en producción.
- Requiere `trust_remote_code=True` y una versión concreta de Transformers (5.20.2), lo que puede complicar la integración en entornos con versiones fijadas.
- Los resultados de evaluación provienen de un monitor fijo de 48 prompts y de la instantánea pública de MusicPrefs; no se ha realizado un estudio de preferencia humana, por lo que la calidad musical percibida no está validada de forma independiente.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El presupuesto de contexto de 6.144 tokens es limitado para conversaciones largas o descripciones musicales muy detalladas.
- El checkpoint corresponde al paso 250 de GRPO; no se documenta si existen checkpoints posteriores con mejor rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensorfiend/TuneLM-LFM3-1.7B-code2music-2011
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset code2music: https://huggingface.co/datasets/tensorfiend/code2music
- Aplicación TuneLM: https://www.tensorwrites.com/tunelm
- Código fuente del proyecto: https://github.com/shanmukh05/TuneLM
- Implementación de respuestas de TuneLM: https://github.com/shanmukh05/TuneLM/blob/main/src/tunelm/composition/responses.py
- Diseño de la recompensa RL: https://github.com/shanmukh05/TuneLM/blob/main/docs/rl-reward-design.md
- Paper de referencia (arXiv:2503.16669): https://arxiv.org/abs/2503.16669
