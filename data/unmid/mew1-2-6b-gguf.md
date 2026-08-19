# Unmid/Mew1-2.6B-GGUF

## Resumen

Mew1-2.6B-GGUF es una colección de cuantizaciones en formato GGUF del modelo Mew1-2.6B, mantenida por el propio autor (Unmid). Mew1-2.6B es un modelo de lenguaje de 2,7 mil millones de parámetros, derivado de la línea LiquidAI/LFM2.5-2.6B, con un ajuste adicional orientado a roleplay y contenido sin censura. El modelo está pensado para ejecutarse localmente mediante llama.cpp, LM Studio u otras aplicaciones compatibles con GGUF.

La relevancia de esta versión radica en su pequeño tamaño (2,6B), que permite inferencia en hardware modesto, y en su ventana de contexto declarada de aproximadamente 128K tokens, algo poco habitual en modelos de esta escala. Al ser una cuantización mantenida por el autor original, se garantiza coherencia con el checkpoint BF16 y la plantilla de chat correspondiente. No obstante, se trata de un derivado comunitario no oficial de Liquid AI ni de SC117.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 (~2,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | aproximadamente 128K tokens (segun metadatos; se recomienda 4K-16K en la practica) |
| Tipos de cuantizacion | Q2_K, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (safetensors BF16 disponible en el repo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Mew1-2.6B en la documentacion proporcionada. Se sabe que proviene de la linea LFM2.5-2.6B de Liquid AI, pero no se especifican detalles como el tipo de atencion, el numero de capas o el metodo de entrenamiento (RLHF, DPO, etc.). El proceso de cuantizacion a GGUF fue realizado por el propio autor del modelo base, lo que garantiza compatibilidad con llama.cpp y otras herramientas.

La cadena de derivacion es: LiquidAI/LFM2.5-2.6B → SC117/LFM2.5-2.6B-Uncensored → Unmid/Mew1-2.6B → esta version GGUF. Esto sugiere que el modelo ha pasado por un ajuste fino orientado a eliminar restricciones de contenido y a mejorar el rendimiento en tareas de roleplay, aunque no se ofrecen datos concretos sobre el dataset o el proceso de entrenamiento.

## Capacidades

- Generacion de texto libre en ingles, con estilo conversacional y orientado a roleplay.
- Soporte de chat multi-turno mediante la plantilla de chat del checkpoint base (incluida en los manifiestos LEAP).
- Contenido sin censura (uncensored), segun la descripcion del autor.
- Ejecucion local en CPU o GPU mediante llama.cpp, LM Studio y otras herramientas compatibles con GGUF.
- Ventana de contexto amplia (hasta 128K tokens en metadatos), aunque el uso practico recomendado es de 4K a 16K tokens.
- No se mencionan capacidades de tool calling, function calling, vision, audio ni modos de razonamiento especiales.

## Casos de uso

- Roleplay y escritura creativa: el modelo esta especificamente ajustado para mantener personajes y narrativas coherentes en conversaciones largas, gracias a su contexto amplio y su naturaleza sin censura.
- Chatbots locales para asistencia personal: al ser ligero (2,6B) y cuantizable, puede ejecutarse en portatiles o mini-PCs con 4-8 GB de RAM, ofreciendo respuestas conversacionales sin conexion.
- Prototipado rapido de aplicaciones de texto: los desarrolladores pueden integrar el modelo en entornos de desarrollo mediante llama.cpp o LM Studio para probar ideas de generacion de texto sin depender de APIs externas.
- Generacion de dialogos para videojuegos o narrativa interactiva: su capacidad de mantener contexto largo permite gestionar tramas ramificadas y multiples personajes en una misma sesion.
- Fines educativos y de investigacion: sirve como ejemplo de modelo pequeno con contexto extendido, util para estudiar tecnicas de cuantizacion y despliegue local.
- Despliegue en entornos con recursos limitados: por su tamaño reducido, cabe en dispositivos embebidos o servidores de baja gama, permitiendo inferencia en tiempo real sin latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras metricas para este modelo o sus predecesores en la documentacion revisada.

## Requisitos de hardware

- VRAM estimada: segun el archivo GGUF elegido. Para Q4_K_M (1,67 GB), se necesitan al menos 2 GB de VRAM libres en GPU, o unos 4 GB de RAM si se ejecuta solo en CPU. Para Q8_0 (2,87 GB), se recomiendan 4 GB de VRAM o 8 GB de RAM.
- GPU recomendadas: cualquier GPU con soporte CUDA o Vulkan de 4 GB o mas (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Tambien funciona en Apple Silicon via Metal.
- En consumer GPU: si, cabe en la mayoria de tarjetas de gama media actuales con cuantizacion Q4_K_M o inferior.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (si se convierte a formato compatible), TGI (con contenedor GGUF), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no hay datos oficiales. En CPU, un Q4_K_M puede generar entre 5 y 15 tokens por segundo en un procesador moderno de 8 nucleos; en GPU, la latencia suele ser inferior a 50 ms por token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A nivel cualitativo, Mew1-2.6B se situa en la misma categoria que otros modelos de ~2,6B como Qwen2.5-3B, Gemma-2-2.6B o Phi-3.5-mini, pero con la diferencia de estar orientado a roleplay sin censura y de ofrecer una ventana de contexto declarada de 128K, muy superior a la de sus competidores (tipicamente 8K-32K). La licencia LFM Open v1.0 impone condiciones de atribucion y uso comercial que deben revisarse antes de su adopcion en productos.

## Limitaciones y advertencias

- Modelo pequeno (2,6B): su capacidad de razonamiento complejo y conocimiento factual es limitada en comparacion con modelos de 7B o superiores.
- Riesgo de alucinacion: al ser un modelo sin censura y de tamaño reducido, puede generar afirmaciones falsas o inventadas con mayor facilidad.
- Sesgos: no se han documentado evaluaciones de sesgo; al estar entrenado principalmente en ingles, puede reflejar sesgos culturales y linguisticos de su corpus.
- Limitaciones de idioma: solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia: LFM Open License v1.0 incluye condiciones de atribucion y restricciones de uso comercial. Es obligatorio revisar el archivo LICENSE antes de cualquier despliegue.
- Contexto practico: aunque los metadatos indican 128K, el uso real con memoria limitada puede degradar el rendimiento; se recomienda no exceder 16K en hardware comun.
- Sin soporte oficial: es un derivado comunitario, no respaldado por Liquid AI ni SC117. El mantenimiento depende del autor individual.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/Unmid/Mew1-2.6B-GGUF
- Checkpoint base BF16: https://huggingface.co/Unmid/Mew1-2.6B
- Cuantizaciones con matriz de importancia (mradermacher): https://huggingface.co/mradermacher/Mew1-2.6B-i1-GGUF
- Modelo origen LiquidAI/LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Version intermedia SC117/LFM2.5-2.6B-Uncensored: https://huggingface.co/SC117/LFM2.5-2.6B-Uncensored
