# thantzinphyo/Hey-Function-270M

## Resumen

Hey-Function-270M es un modelo de lenguaje compacto de 270 millones de parámetros, especializado en la generación de llamadas a funciones (function calling) para aplicaciones en dispositivos de borde. Lo desarrolla Thant Zin Phyo (usuario `thantzinphyo` en HuggingFace) y deriva por ajuste fino completo de `google/functiongemma-270m-it`, el modelo de Gemma 3 orientado a tool use publicado por Google. Su propósito es traducir instrucciones en inglés, birmano (myanmar) y code-switching entre ambos a llamadas de herramienta estructuradas en formato JSON, algo que el modelo base solo cubre con solvencia en inglés.

La relevancia del modelo reside en dos factores. Por un lado, aborda un idioma de bajos recursos como el birmano, cuya estructura sujeto-objeto-verbo requiere una alineación específica de las representaciones de atención que el ajuste fino de parámetros completos pretende capturar. Por otro, su tamaño reducido (268.098.176 parámetros, 1,1 GB en el repositorio) lo convierte en un candidato para ejecución local en móviles, placas IoT y dispositivos de borde, sin dependencia de API en la nube.

Se trata de una versión Alpha concebida como prueba de concepto: entrenada durante una sola época sobre un conjunto de 42.6K muestras y evaluada sobre 191 ejemplos internos, con una precisión exacta global del 56,0 %. La arquitectura es un decoder transformer de tipo `gemma3_text`, con licencia Apache 2.0 y disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (`gemma3_text`) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.800 tokens en entrenamiento (contexto extendido); longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados; el autor planea exportar a GGUF y LiteRT con int4/int8 |
| Idiomas soportados | Birmano (`my`), ingles (`en`) y code-switching entre ambos |
| Licencia | Apache 2.0, sujeta a los Gemma Terms of Use del modelo base |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/functiongemma-270m-it`, un decoder transformer de la familia Gemma 3 con 270M de parámetros y ajuste por instrucciones. Sobre esa base se aplicó un ajuste fino de parámetros completos (full-parameter tuning), desbloqueando las 270M de pesos y sin adaptadores de bajo rango como LoRA. El autor justifica esta decisión porque la capacidad de tool calling del modelo base se entrenó casi exclusivamente en inglés, y la adaptación completa permite alinear las representaciones de atención con la estructura SOV del birmano y con los esquemas de entidades del dominio.

El entrenamiento utilizó collation dinámica de candidatos: por cada muestra se emparejó la herramienta objetivo con dos distractores negativos, evitando el desbordamiento del esquema de 61 herramientas y ajustándose al presupuesto de 2.800 tokens, con un 0,0 % de truncamiento sobre las 42.6K muestras. La pérdida se enmascaró en modo response-only (etiqueta -100 para tokens de sistema, esquema de herramientas y consulta del usuario), de modo que los gradientes se calcularon exclusivamente sobre los tokens generados de la llamada (`<start_function_call>call:...<end_function_call>`). La optimización se ejecutó en una NVIDIA Tesla T4 de 16 GB, con batch efectivo de 32 (micro-batch 1 y 32 pasos de acumulación), AdamW, precisión mixta FP16, learning rate de 2e-5 con warmup lineal de 36 pasos y decaimiento lineal durante 1 época (1.214 pasos). La entropía cruzada por chunks con `chunk_size=256` mantuvo el pico de VRAM por debajo de 5,0 GB.

## Capacidades

- Generación de llamadas a funciones estructuradas a partir de lenguaje natural, con soporte de esquemas de hasta 61 herramientas en el contexto de entrenamiento.
- Comprensión de instrucciones en birmano, inglés y code-switching birmano-inglés dentro de la misma frase.
- Extracción de argumentos para herramientas como creación de contactos, eventos de calendario, navegación, correo y control de medios.
- Formato de salida delimitado por etiquetas especiales (`<start_function_call>` / `<end_function_call>`), orientado a parseo directo.
- Capacidad de selección entre herramienta objetivo y distractores, entrenada explícitamente con pares negativos.
- No se documentan capacidades de visión, audio, razonamiento multi-paso autónomo ni agentes de largo horizonte; el alcance es el de un invocador de herramientas de un solo turno.

## Casos de uso

- Asistentes de voz en birmano para Android: el modelo traduce una orden hablada transcrita ("abre la linterna", "pon música") a la llamada de herramienta correspondiente, ejecutable en el propio dispositivo sin enviar audio ni texto a la nube.
- Automatización de dispositivos IoT: placas y pasarelas de borde con poca memoria pueden alojar el modelo para interpretar comandos de usuario y disparar acciones sobre actuadores mediante un esquema de herramientas predefinido.
- Aplicaciones Flutter multiplataforma: integración en apps móviles para convertir entradas mixtas birmano-inglés en llamadas a APIs nativas (calendario, contactos, mapas) sin coste de inferencia por token.
- Asistente de accesibilidad: control por voz de funciones del teléfono (volumen, linterna, reproducción multimedia) para usuarios con movilidad reducida, con latencia local y sin conexión.
- Enrutamiento de intenciones en chatbots: clasificación de la petición del usuario y generación del JSON de la herramienta adecuada antes de derivar a un backend conversacional más grande.
- Investigación en function calling multilingüe: banco de pruebas para estudiar la transferencia de capacidades de tool use desde inglés hacia idiomas de bajos recursos y el efecto del ajuste completo frente a PEFT.
- Pruebas de concepto de asistentes de productividad: creación de eventos de calendario o contactos a partir de frases en birmano, con la advertencia de que la precisión de argumentos aún es limitada.

## Benchmarks y rendimiento

Evaluación del autor sobre 191 muestras internas:

| Registro / idioma | Muestras | Fn Acc (%) | Arg Acc (%) | Exact Match (%) |
|---|---|---|---|---|
| Inglés | 71 | 69,0 | 67,6 | 67,6 |
| Birmano | 47 | 44,7 | 44,7 | 44,7 |
| Code-switch | 73 | 52,1 | 52,1 | 52,1 |
| Global | 191 | 56,5 | 56,0 | 56,0 |

Precisión por herramienta (mínimo 3 muestras):

| Herramienta | Aciertos | Total | Precisión (%) |
|---|---|---|---|
| `turn_off_flashlight` | 12 | 12 | 100,0 |
| `check_traffic` | 3 | 3 | 100,0 |
| `open_website` | 4 | 4 | 100,0 |
| `open_wifi_settings` | 8 | 9 | 88,9 |
| `create_contact` | 30 | 35 | 85,7 |
| `turn_on_flashlight` | 15 | 18 | 83,3 |
| `navigate_to` | 13 | 16 | 81,2 |
| `send_email` | 18 | 26 | 69,2 |
| `show_map` | 17 | 29 | 58,6 |
| `create_calendar_event` | 33 | 61 | 54,1 |
| `set_volume_level` | 2 | 4 | 50,0 |
| `play_music` | 12 | 26 | 46,2 |
| `control_media` | 1 | 6 | 16,7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en FP16 para los 268M de parámetros (aproximadamente 0,54 GB solo de pesos), más overhead de activaciones y KV cache.
- Entrenamiento validado en una NVIDIA Tesla T4 de 16 GB con pico de menos de 5,0 GB en FP16 y batch efectivo de 32.
- Inferencia viable en GPU de consumo como RTX 3060, RTX 4060 o superiores; también en CPU y en aceleradores integrados por el tamaño reducido.
- Despliegue: al no publicarse pesos GGUF ni LiteRT, las opciones inmediatas son transformers con safetensors y, potencialmente, vLLM o TGI para servir en FP16/BF16; llama.cpp y Ollama requieren conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Hey-Function-270M | 268M | 2.800 tokens (entrenamiento) | my, en | Apache 2.0 (+ Gemma Terms) | Function calling en birmano/inglés |
| google/functiongemma-270m-it | 270M (aprox.) | No disponible | Principalmente en | Gemma Terms of Use | Function calling en inglés |
| Modelos de tool calling de mayor tamaño (p. ej. familias de 7B-8B) | 7B-8B | 8K-128K típicamente | Multilingüe amplio | Variable | Function calling generalista |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia publicado es el modelo base, sobre el que este ajuste mejora la cobertura del birmano a costa de una precisión global modesta (56,0 % de exact match).

## Limitaciones y advertencias

- Versión Alpha: una sola época de entrenamiento y un conjunto de evaluación de 191 muestras, insuficiente para conclusiones robustas.
- Precisión baja en birmano (44,7 % exact match) y en code-switching (52,1 %), lo que limita su uso en producción sin un sistema de validación posterior.
- Herramientas con peor rendimiento: `control_media` (16,7 %), `play_music` (46,2 %) y `set_volume_level` (50,0 %).
- La extracción de argumentos complejos (fechas, horas, importes y nombres en birmano) es el punto débil declarado por el autor y está pendiente de más épocas de entrenamiento.
- Riesgo de alucinación en nombres de herramientas o argumentos cuando la consulta se aleja de la distribución del dataset; no se documentan salvaguardas.
- No se han publicado análisis de sesgos; el modelo hereda los del base y los del dataset sintético `thantzinphyo/Hey-Function-Burmese`.
- Contexto de entrenamiento de 2.800 tokens: esquemas de herramientas grandes o conversaciones multi-turno largas pueden excederlo.
- Licencia Apache 2.0 sujeta a los Gemma Terms of Use del modelo base; conviene revisar las restricciones de uso comercial de dichos términos antes de desplegar.
- Sin pesos cuantizados publicados: el despliegue en móvil requiere exportación propia a GGUF o LiteRT.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thantzinphyo/Hey-Function-270M
- Dataset: https://huggingface.co/datasets/thantzinphyo/Hey-Function-Burmese
- Repositorio de código: https://github.com/thantzinphyo-gg/Hey-Function-Burmese
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
