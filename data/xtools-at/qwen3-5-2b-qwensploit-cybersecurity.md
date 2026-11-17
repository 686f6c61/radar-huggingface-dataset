# xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity

## Resumen

Qwensploit 3.5 2B es un ajuste fino (fine-tune) especializado en ciberseguridad y red team sobre un merge de modelos de la familia Qwen3.5-2B. Lo desarrolla el usuario xtools-at y se distribuye en Hugging Face bajo licencia Apache-2.0 (con reservas sobre la compatibilidad de licencias upstream). El modelo parte de `xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic`, un merge que combina destilaciones de razonamiento, código y razonamiento multi-paso, y se entrena mediante LoRA supervisado sobre 7.000 ejemplos de cuatro datasets de ciberseguridad, red team y destilación sintética.

El problema que aborda es la falta de modelos pequeños y accesibles con conocimientos específicos de seguridad ofensiva y defensiva, análisis de vulnerabilidades y revisión de código seguro. Con 2.213.241.664 parámetros totales (aproximadamente 2,2 mil millones) y un contexto de entrenamiento de 8.192 tokens, está pensado para ejecutarse en hardware modesto, lo que lo hace atractivo para laboratorios, CTF y formación.

Es relevante ahora porque el ecosistema de modelos "uncensored" y especializados en seguridad crece rápidamente, y este modelo ofrece una alternativa de 2B parámetros con licencia permisiva declarada, aunque con advertencias claras sobre la necesidad de revisar las licencias heredadas de los datasets de destilación. El autor mantiene una familia de variantes (2B, 4B y 9B) y una versión V2 posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino con LoRA (PEFT) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (sujeta a revision de compatibilidad con licencias upstream) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 2,2 mil millones de parametros, ajustado mediante Supervised Fine-Tuning con LoRA sobre el merge `Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic`. La configuracion de entrenamiento usa rango LoRA 16, alpha 32, dropout 0,02 y aplicacion a todos los modulos objetivo, con optimizador AdamW de 8 bits, learning rate 2e-4, scheduler lineal, weight decay 0,002, batch efectivo de 4x8 y una sola epoca sobre 7.000 entradas (con 350 de evaluacion), en una GPU NVIDIA L4 de 24 GB. La longitud maxima de entrada fue de 8.000 caracteres y el contexto de entrenamiento de 8.192 tokens.

El dataset de entrenamiento combina cuatro fuentes: CyberSec-Reasoning-Premium (2.305 entradas, 33%), RedTeam-Premium (2.385, 34%), Claude Mythos Distilled 25K Clean (1.385, 20%) y Qwen3.8-Max Distillation 50K Clean (925, 13%). Estas fuentes se construyen a su vez sobre datasets como Cybersecurity Reasoning Dataset, Ultimate Offensive Red Team, claude_mythos_distilled_25k y qwen3.8-max-distillation-50k. La mezcla combina ejemplos de ciberseguridad y red team con datos sinteticos de razonamiento, codigo e instrucciones generales. No se documenta el uso de RLHF o DPO; el entrenamiento es puramente supervisado. La perdida final reportada es 0,710 de entrenamiento y 0,696 de evaluacion, con un descenso progresivo a lo largo de los pasos 66, 110, 154 y 219.

## Capacidades

- Generacion de texto y respuesta a preguntas tecnicas de ciberseguridad.
- Razonamiento sobre vulnerabilidades, analisis de amenazas y modelado de riesgos.
- Revision de codigo seguro y deteccion de patrones inseguros.
- Conocimiento de red team: tecnicas ofensivas, reconocimiento y explotacion en entornos autorizados.
- Soporte para retos CTF y educacion en seguridad.
- Generacion y explicacion de codigo en contextos de seguridad y programacion general.
- Razonamiento multi-paso heredado del merge base (destilaciones de razonamiento).
- Capacidad multimodal declarada por el pipeline `image-text-to-text` en Hugging Face, aunque no se detalla en la model card el alcance real de vision.
- Conversacion multi-turno en ingles.
- Modo "uncensored" orientado a reducir rechazos en consultas de seguridad ofensiva.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Analisis de vulnerabilidades en auditorias: el modelo puede revisar fragmentos de codigo y describir posibles fallos (inyeccion, desbordamientos, configuraciones inseguras) apoyandose en su entrenamiento especifico de CyberSec-Reasoning, aunque los resultados deben validarse manualmente.
- Revision de codigo seguro en pipelines de desarrollo: integrado como asistente de revision, puede senalar practicas inseguras y proponer alternativas, gracias a su mezcla de datos de codigo y seguridad.
- Formacion y concienciacion en ciberseguridad: sirve para generar escenarios, preguntas y explicaciones tecnicas en entornos educativos, con contexto de 8.192 tokens suficiente para material didactico extenso.
- Retos CTF: puede ayudar a razonar sobre pistas, identificar tecnicas y explicar pasos de resolucion, aprovechando el conocimiento de red team y el razonamiento multi-paso heredado.
- Ejercicios de red team autorizados: como asistente de planificacion de pruebas de penetracion, puede proponer tecnicas y comandos que el operador debe revisar y ejecutar solo en entornos con autorizacion explicita.
- Analisis de incidentes y threat modeling: puede estructurar hipotesis sobre vectores de ataque y contramedidas defensivas, usando su conocimiento de seguridad defensiva y ofensiva.
- Asistente de laboratorio en hardware modesto: al ser un modelo de 2B, puede desplegarse en una unica GPU de consumo o en CPU con cuantizacion, lo que facilita su uso en laboratorios personales y entornos de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de perdida de entrenamiento y evaluacion (0,710 y 0,696 respectivamente), que no constituyen una medida directa de precision en tareas de ciberseguridad ni de seguridad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 2,2B parametros, en FP16 se requieren aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 2,2-3 GB y en 4 bits alrededor de 1,5-2 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L4 de 24 GB; para inferencia son suficientes GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 6 GB o mas en FP16 y en GPUs de 4 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan documentados en la informacion disponible, aunque al ser un modelo transformers estandar podrian ser compatibles previa conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit 3.5 2B | 2,2B | 8.192 | Ciberseguridad y red team (LoRA) | Apache-2.0 (con reservas upstream) | Hugging Face |
| Qwensploit 4B | No disponible en la informacion | No disponible | Ciberseguridad y red team | Apache-2.0 (declarada) | Hugging Face |
| Qwensploit 9B | No disponible en la informacion | No disponible | Ciberseguridad y red team | Apache-2.0 (declarada) | Hugging Face |
| Qwen3.5-2B (base de la familia) | ~2B | No disponible | Modelo generalista | No disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a alternativas de la misma categoria; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Puede generar explicaciones inexactas, codigo inseguro o consejos de seguridad desactualizados.
- Los datos de destilacion sintetica pueden contener errores heredados de los modelos profesor.
- El rendimiento en tareas de seguridad del mundo real no ha sido establecido de forma independiente.
- Debe usarse exclusivamente en sistemas para los que se tenga autorizacion explicita de pruebas.
- Es necesario revisar comandos, codigo y recomendaciones generados antes de su uso.
- La licencia Apache-2.0 declarada esta sujeta a revision de las licencias upstream; en particular, el dataset de destilacion de Qwen documenta restricciones heredadas que pueden afectar al uso downstream y comercial.
- Solo soporta ingles, lo que limita su uso en entornos en castellano sin traduccion previa.
- El contexto de 8.192 tokens puede ser insuficiente para analisis de repositorios o documentos muy extensos.
- El caracter "uncensored" implica un mayor riesgo de generar contenido ofensivo o peligroso; requiere salvaguardas adicionales en produccion.
- No se documentan mecanismos de tool calling ni de agentes, por lo que su integracion en pipelines automatizados requiere envoltorios propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Merge relacionado: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge
- Familia Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 4B: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity
- Variante 9B: https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
- Version V2: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
