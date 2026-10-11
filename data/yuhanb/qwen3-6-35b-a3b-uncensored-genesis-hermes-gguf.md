# yuhanb/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF

## Resumen
Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF es una distribucion en formato GGUF publicada por el usuario yuhanb sobre el modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, a su vez construido sobre la familia Qwen3.6. El resultado es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token, con soporte multimodal nativo (texto, imagen y video) y una ventana de contexto nativa de 262.144 tokens.

La publicacion parte de dos linajes: el modelo base sin censura de HauhauCS y un ajuste fino orientado a uso agentico derivado de DJLougen/hermes-qwen3.5-35b-a3b-GGUF, entrenado con el dataset NousResearch/hermes-function-calling-v1 para mejorar el soporte de function calling. Sobre esa combinacion, el autor aplica una tecnica propia de reparacion numerica de tensores denominada Sig-ScaleSync-Genesis, que corrige desalineaciones de escala en pesos sin reentrenar el modelo.

El interes practico radica en tres puntos: la relacion entre parametros totales y activos (MoE que reduce el coste de inferencia frente a un denso de tamano equivalente), la arquitectura hibrida con atencion lineal Gated DeltaNet combinada con atencion softmax completa, y la politica declarada de 0 rechazos sobre 465 peticiones de evaluacion. La licencia Apache 2.0 y la disponibilidad en GGUF facilitan su ejecucion en hardware de consumo con offload parcial a CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: Gated DeltaNet (atencion lineal) + atencion softmax completa, en proporcion 3:1 |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B por token (MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible a 1.000.000 con YaRN |
| Tipos de cuantizacion | GGUF en multiples niveles; el autor recomienda APEX y Q8_K_P; etiquetado como imatrix |
| Idiomas soportados | Ingles, chino y multilingue (la model card declara 201 idiomas; metadatos de HuggingFace: en, zh, multilingual) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto); la vision requiere un fichero mmproj adicional |
| Tamano del repositorio | 145,1 GB |
| Vocabulario | 248.000 tokens |
| Capas | 40 |
| Expertos | 256 por capa; 8 enrutados + 1 compartido por token |
| Patron de capas | 10 x (3 x DeltaNet-MoE + 1 x Attention-MoE) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura hibrida que intercala bloques de atencion lineal Gated DeltaNet con bloques de atencion softmax completa en una proporcion 3:1, repetida 10 veces a lo largo de 40 capas. La componente MoE incorpora 256 expertos por capa, de los que se activan 8 enrutados mas 1 compartido en cada token, lo que da lugar a los aproximadamente 3.000 millones de parametros activos sobre un total de 34.660 millones. Esta combinacion busca mantener la calidad de atencion completa en las capas de mayor relevancia semantica y reducir el coste computacional en el resto mediante atencion lineal.

No se dispone del numero de tokens de entrenamiento, de la composicion detallada del dataset ni de si se aplicaron fases de RLHF o DPO. El unico dato de entrenamiento confirmado es el uso de NousResearch/hermes-function-calling-v1 en la rama Hermes orientada a function calling. La innovacion tecnica documentada por el autor no es un entrenamiento adicional, sino una reparacion numerica de tensores: un analisis de 500 tensores identifico 3 capas ssm_conv1d con desalineacion de escala (sigma_w entre un 50 % y un 100 % por encima de la mediana), que se corrigieron multiplicando por un factor alfa entre 0,577 y 0,653. Segun la model card, la inspeccion declara 497 de 500 tensores considerados sanos y una reduccion del error W1 de aproximadamente el 80 % en las capas reparadas.

## Capacidades
- Generacion de texto conversacional multi-turno con ventanas de contexto de hasta 262.144 tokens nativos.
- Razonamiento multi-paso con modo "thinking" activado por defecto, configurable mediante parametros de muestreo diferenciados para tareas generales y de codigo.
- Generacion y asistencia en codigo, apoyada en el modo thinking y en una configuracion especifica de temperatura (0,6) para tareas de precision.
- Soporte multimodal nativo: entrada de imagenes y video ademas de texto (requiere el fichero mmproj para vision en GGUF).
- Function calling y tool calling, reforzado por el ajuste fino sobre hermes-function-calling-v1.
- Uso agentico: los tags del repositorio incluyen "agentic" y el linaje Hermes esta orientado a flujos de agente.
- Capacidades multilingues: la model card declara 201 idiomas, con enfasis documentado en ingles y chino.
- Politica de rechazo baja: el modelo base declara 0 rechazos sobre 465 peticiones de evaluacion.

## Casos de uso
- Asistentes conversacionales de contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos o documentos completos en memoria sin truncado, adecuado para atencion al cliente y asistentes de soporte tecnico.
- Agentes de automatizacion con herramientas: el ajuste sobre hermes-function-calling-v1 y el soporte de tool calling permiten construir agentes que invocan APIs, ejecutan busquedas y encadenan pasos en pipelines de automatizacion.
- Analisis de documentos con imagenes: al aceptar entrada de imagen y video, puede procesar capturas, diagramas o fotogramas junto al texto para tareas de extraccion y resumen multimodal.
- Generacion de codigo en entornos locales: la distribucion GGUF permite ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, integrarlo en editores o en scripts de CI/CD con llamadas locales.
- Procesamiento multilingue: con soporte declarado de ingles, chino y multilingue, resulta util para traduccion, resumen y clasificacion en entornos con idiomas mixtos.
- Prototipado rapido de aplicaciones LLM: la licencia Apache 2.0 y el formato GGUF facilitan desplegar pruebas de concepto sin costes de licencia.
- Investigacion sobre arquitecturas hibridas: los bloques Gated DeltaNet combinados con atencion completa permiten estudiar el comportamiento de la atencion lineal en tareas de contexto largo.
- Investigacion sobre alineacion y censura: al ser un modelo declarado sin censura, sirve como objeto de estudio en evaluaciones de sesgo y de politicas de rechazo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (estimaciones basadas en los 34,66 B de parametros totales, no en mediciones publicadas): Q8 en torno a 35-37 GB; Q6_K en torno a 28-30 GB; Q5_K_M en torno a 24-26 GB; Q4_K_M en torno a 20-22 GB; Q3_K_M en torno a 16-18 GB; Q2_K en torno a 12-13 GB. Los valores exactos por cuantizacion no estan publicados.
- Cuantizacion APEX: el autor la recomienda pero no especifica su tamano en bits ni su huella de VRAM; no disponible.
- GPU de datacenter: A100 80 GB, H100 80 GB o H200 permiten cargar las cuantizaciones altas (Q8, Q6) integramente en memoria.
- GPU de consumo: una RTX 3060 de 12 GB puede ejecutar el modelo con offload parcial. El autor propone desplazar los pesos MoE de 25 capas a CPU, fijar el offload de GPU en 15, cuantizar las caches K y V en Q8_0 y usar semilla 42.
- En consumer no cabe completo en 12 GB; se requiere offload a CPU o GPU con mas memoria (por ejemplo, 24 GB para cuantizaciones bajas completas).
- Opciones de despliegue: llama.cpp con el flag --jinja para el manejo correcto de la plantilla de chat, mas el fichero mmproj para vision. No se documentan integraciones con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF | ~34,66 B | ~3 B | 262.144 (1 M con YaRN) | Apache 2.0 | GGUF, HuggingFace |
| Qwen3-30B-A3B (referencia publica) | ~30 B | ~3 B | 128.000 | Apache 2.0 | HuggingFace |
| Mixtral 8x7B (referencia publica) | ~46,7 B | ~12,9 B | 32.000 | Apache 2.0 | HuggingFace |
| DeepSeek-V3 (referencia publica) | ~671 B | ~37 B | 128.000 | Licencia propia | HuggingFace |

Nota: los valores de los modelos de referencia proceden de informacion publica general y no de la informacion proporcionada en esta busqueda; los datos concretos de rendimiento comparado no estan disponibles.

## Limitaciones y advertencias
- Modelo declarado "uncensored": cabe esperar una tasa de rechazo muy baja ante peticiones sensibles, lo que implica un riesgo elevado de generar contenido inapropiado, ilegal o danino si no se aplican filtros externos.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su rendimiento en MMLU, HumanEval, GSM8K u otras pruebas estandar.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion.
- La ampliacion de contexto a 1.000.000 de tokens mediante YaRN no esta validada con datos publicados y puede degradar la calidad.
- La vision requiere un fichero mmproj adicional; sin el, la entrada de imagen no funciona correctamente.
- La model card advierte de mantener al menos 128.000 tokens de contexto para preservar las capacidades de razonamiento en modo thinking.
- La reparacion de tensores afecta a tres capas ssm_conv1d relacionadas con la memoria de contexto largo; aunque el autor reporta mejoras de distribucion, no hay evaluacion de calidad downstream que confirme el efecto.
- Adopcion muy baja: 349 descargas y 1 "like" en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado por un modelo sin censura puede incumplir las politicas de la plataforma o la legislacion aplicable; la responsabilidad recae en el integrador.
- El repositorio ocupa 145,1 GB, por lo que conviene seleccionar una unica cuantizacion en lugar de clonar todo el arbol.
- El modelo base y este ajuste estan asociados a nombres y fechas de publicacion poco habituales; conviene verificar la procedencia antes de usarlo en produccion.
- La informacion disponible no detalla la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de alineacion, lo que dificulta evaluar sesgos conocidos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/yuhanb/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Ajuste fino Hermes de referencia: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Plantilla de chat recomendada: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates/raw/main/chat_template.jinja
- Prompt de sistema recomendado: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF/raw/main/System_Prompt_Base.txt
- Script de cuantizacion: https://pastebin.com/hXhcMJn9
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Donaciones (Telegram Tribute): https://web.tribute.tg/d/KIH
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
