# Wynnoaasf/wynr-ai-1.5b-v2

## Resumen

Wynr AI 1.5B v2 (identificador de repositorio `Wynnoaasf/wynr-ai-1.5b-v2`) es un ajuste fino mediante LoRA publicado como adaptador PEFT sobre el modelo base `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`, es decir, sobre la variante de 1.500 millones de parámetros de la familia Qwen2.5 de Alibaba, cuantizada en 4 bits por Unsloth para abaratar el entrenamiento. No se trata por tanto de un modelo entrenado desde cero, sino de un artefacto de adaptación de bajo rango que debe cargarse junto al modelo base (o fusionarse con él) para poder inferir. El autor es el usuario de Hugging Face Wynnoaasf, que mantiene también una versión previa `wynr-ai-1.5b-v1`.

El objetivo declarado en los metadatos es el de un modelo pequeño de conversación y respuesta a preguntas en vietnamita e inglés. La etiqueta `wynr-ai` y la referencia a `vietnamese` en los tags sitúan el proyecto en el nicho de los SLM (small language models) orientados a un idioma con poca representación relativa en los corpus de entrenamiento de los grandes modelos, donde un ajuste fino ligero sobre una base multilingüe suele ser la vía más económica de mejorar la calidad en ese idioma.

La relevancia práctica del repositorio es limitada por su madurez: cuenta con 0 descargas y 0 likes en el momento de la consulta, la model card no incluye datos de entrenamiento, hiperparámetros, evaluación ni ejemplos de uso, y los metadatos de licencia son contradictorios (los tags indican Apache-2.0 mientras el campo de licencia aparece como no disponible). Debe tratarse, por tanto, como un experimento reproducible antes que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention, heredada del modelo base Qwen2.5-1.5B-Instruct; el artefacto publicado es un adaptador LoRA (PEFT), no un modelo completo |
| Parametros totales | 1.500 millones en el modelo base; el adaptador no declara rango, alpha ni número de parámetros entrenables (no disponible) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct (extensible a 131.072 con RoPE scaling tipo YaRN); el autor no verifica ni documenta la contexto efectiva tras el fine-tuning (no disponible) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors y requiere cargarse sobre el base o fusionarse; el base de referencia está en bnb-4bit. El autor no publica GGUF, AWQ ni GPTQ (no disponible) |
| Idiomas soportados | Vietnamita e inglés según los tags del repositorio; el modelo base Qwen2.5 es multilingüe (aproximadamente 29 idiomas) |
| Licencia | Apache-2.0 según los tags del repositorio; el campo de licencia de los metadatos consultados figura como "no disponible" (discrepancia sin resolver) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base de referencia en formato bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 28 capas, dimensión oculta 1.536, 12 cabezas de atención y 2 cabezas KV (GQA), vocabulario de 151.936 tokens y normalización RMSNorm con activación SwiGLU. El modelo base fue entrenado por Alibaba con un pipeline que incluye preentrenamiento en hasta 18 billones de tokens y un posterior ajuste supervisado más optimización por preferencias; estas cifras corresponden a la documentación pública de Qwen2.5 y no están verificadas en la model card del adaptador. La variante `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit` es una conversión a 4 bits (bitsandbytes) pensada para reducir el consumo de VRAM durante el ajuste fino.

Sobre el entrenamiento del adaptador no hay información: la model card no detalla el número de tokens, la composición del dataset, el rango del LoRA, la tasa de aprendizaje, las épocas ni si hubo una fase de DPO o RLHF. Los tags `unsloth` y `lora` permiten inferir que se usó la librería Unsloth para el entrenamiento con LoRA, y la etiqueta `conversational` sugiere un corpus en formato de diálogo, presumiblemente en vietnamita. Tampoco se documenta ninguna innovación técnica propia: la decodificación es la estándar del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en vietnamita e inglés, heredando el formato de chat de Qwen2.5-Instruct (roles system, user y assistant).
- Respuesta a preguntas y resumen de documentos cortos, dentro de los límites de un modelo de 1.500 millones de parámetros.
- Generación de código y razonamiento matemático básico, capacidades presentes en el base Qwen2.5-1.5B-Instruct aunque no reevaluadas tras el ajuste.
- Soporte de tool calling y function calling en formato JSON, heredado del modelo base Qwen2.5; el adaptador no documenta si esta capacidad se preserva.
- Capacidad multilingüe residual del base (aproximadamente 29 idiomas), potencialmente degradada por un ajuste fino centrado en vietnamita.
- No dispone de visión, audio, modo thinking explícito ni ventana de contexto extendida documentada por el autor.

## Casos de uso

- Asistente conversacional en vietnamita para atención al cliente: el modelo puede gestionar diálogos multi-turno con el formato de chat de Qwen2.5 y, al ejecutarse en 4 bits, desplegarse en una única GPU de gama media o incluso en CPU, lo que abarata el coste por conversación frente a modelos de 7B o superiores.
- Clasificación y enrutado de tickets de soporte: con prompts de sistema bien definidos y salida estructurada en JSON, se puede usar para etiquetar consultas por idioma, intención y urgencia antes de derivarlas a un humano o a un modelo mayor.
- Generación de respuestas FAQ y artículos de ayuda en vietnamita: útiles para bases de conocimiento con contenido escaso en ese idioma, donde un SLM ajustado puede superar a un modelo genérico más grande en fluidez local.
- Prototipado rápido y pruebas de concepto: al ser un adaptador LoRA sobre una base de 1.5B cuantizada, permite iterar en un portátil con GPU de 8 GB y validar ideas de producto antes de invertir en modelos mayores.
- Traducción asistida inglés-vietnamita en entornos con requisitos de baja latencia o sin conectividad, mediante despliegue local con llama.cpp u Ollama tras fusionar el adaptador.
- Extracción de información de documentos cortos (pedidos, correos, formularios) en pipelines por lotes: la ventana de 32K del base permite procesar varios documentos por llamada, y el tamaño reducido hace viable ejecutar miles de peticiones en hardware modesto.
- Componente de un sistema con decodificación especulativa: al ser un modelo pequeño, puede actuar como modelo borrador para acelerar a un modelo de referencia mayor en la misma familia Qwen2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye evaluaciones en MMLU, HumanEval, GSM8K, ViMMRC ni en ningún otro conjunto, y tampoco se han encontrado referencias externas con métricas de este adaptador concreto.

| Benchmark | wynr-ai-1.5b-v2 | Qwen2.5-1.5B-Instruct (referencia publica) |
|---|---|---|
| MMLU | no disponible | no verificado en esta busqueda |
| HumanEval | no disponible | no verificado en esta busqueda |
| GSM8K | no disponible | no verificado en esta busqueda |
| Benchmarks en vietnamita | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia tras fusionar el adaptador con el base: aproximadamente 3,1 GB en FP16 (1.500 millones de parámetros a 2 bytes), más 0,5-2 GB de caché KV según longitud de contexto y tamaño de lote.
- En cuantización de 8 bits: alrededor de 1,6-2 GB de pesos. En 4 bits (Q4_K_M en GGUF): aproximadamente 1,0-1,1 GB, con una calidad degradada de forma moderada.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM sirve para FP16 (RTX 3060, RTX 4060, RTX 2060 SUPER); para 4 bits basta con 3-4 GB (GTX 1650, RTX 3050 portátil). En datacenter no tiene sentido dedicarle una A100 o H100 salvo para servir muchos lotes concurrentes; una L4 o una T4 son suficientes.
- Cabe holgadamente en GPU consumer y también en CPU: con llama.cpp en un procesador moderno de 8 núcleos se obtienen velocidades de lectura interactivas, aunque no se han publicado cifras concretas para este adaptador.
- Opciones de despliegue: transformers + PEFT cargando el adaptador sobre el base; fusión previa (`merge_and_unload`) y exportación a GGUF para llama.cpp, Ollama o LM Studio; vLLM y TGI admiten el base Qwen2.5-1.5B-Instruct con adaptadores LoRA dinámicos, lo que permite servir varias variantes sobre una sola copia del modelo en memoria.
- Latencia y throughput: no disponibles. En un modelo de este tamaño con lote 1 la latencia está dominada por el ancho de banda de memoria, por lo que en una RTX 4090 se espera una generación claramente superior a la velocidad de lectura humana, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wynr-ai-1.5b-v2 | 1,5B (adaptador LoRA) | 32K heredados del base, no verificados | Apache-2.0 según tags, no confirmada | 0 descargas, sin evaluación | Requiere el modelo base para funcionar |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (hasta 128K con YaRN) | Apache-2.0 | Muy extendido, ecosistema amplio | Base directa de este adaptador; referencia obligada |
| Llama-3.2-1B-Instruct | 1,23B | 128K | Llama 3.2 Community License | Muy extendido | Multilingüe oficial, licencia con restricciones de uso |
| Gemma 2 2B Instruct | 2,6B | 8K | Gemma Terms of Use | Extendido | Mayor tamaño y calidad media superior, contexto más corto |
| SmolLM2-1.7B-Instruct | 1,7B | 8K | Apache-2.0 | Extendido | Alternativa ligera centrada en inglés |

Los datos de los modelos de terceros provienen de su documentación pública y no han sido verificados en la búsqueda realizada para esta ficha; deben contrastarse antes de tomar una decisión de arquitectura.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni ejemplos de salida que permitan estimar si el ajuste fino mejora o degrada las capacidades originales.
- Riesgo alto de olvido catastrófico: un LoRA entrenado sobre un corpus conversacional en vietnamita puede degradar el rendimiento en inglés, en código y en tool calling respecto al base Qwen2.5-1.5B-Instruct, sin que el autor lo documente.
- Alucinación: con 1.500 millones de parámetros la precisión factual es intrínsecamente baja; no debe usarse como fuente de verdad en dominios técnicos, médicos, legales o financieros sin verificación externa.
- Sesgos desconocidos: no se describe la composición del dataset de ajuste, por lo que no es posible auditar sesgos de género, dialecto, político o religioso en la variante vietnamita.
- Ambigüedad de licencia: los tags indican Apache-2.0 pero el campo de licencia de los metadatos aparece como no disponible. Antes de un uso comercial debe confirmarse por escrito, y en cualquier caso se heredan las obligaciones de la licencia del modelo base Qwen2.5-1.5B (Apache-2.0).
- El adaptador no es autónomo: no puede ejecutarse sin descargar el modelo base `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit` o el Qwen2.5-1.5B-Instruct original, lo que añade dependencia y peso al despliegue.
- Longitud de contexto efectiva no verificada: aunque el base soporte 32K, no hay garantía de que el ajuste fino haya preservado el rendimiento en contextos largos.
- Mantenimiento incierto: 0 descargas y 0 likes indican un proyecto sin validación comunitaria; las fechas de creación y actualización registradas (25 y 26 de octubre de 2026) y la falta de historial de versiones no permiten inferir soporte a largo plazo.
- Idiomas: solo se declaran vietnamita e inglés; el uso en castellano u otros idiomas no está soportado ni evaluado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Wynnoaasf/wynr-ai-1.5b-v2
- Versión anterior v1: https://huggingface.co/Wynnoaasf/wynr-ai-1.5b-v1
- Modelo base del adaptador (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Artículo sobre Qwen2.5-1.5B y despliegue en aceleradores Ascend: https://aichina.news/blog/small-model-massive-potential-qwen2-5-1-5b-arrives-on-the-ascend-19ybyi/
- Lista curada de modelos abiertos de seguridad ofensiva (contexto de ecosistema, sin relación directa con este modelo): https://github.com/JoasASantos/Offensive-Security-AI-Models
