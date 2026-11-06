# Unluckkie/CallForge-1B-v2-IK-GGUF

## Resumen

CallForge-1B-v2-IK-GGUF es un conjunto de cuantizaciones GGUF del modelo CallForge-1B-v2, un ajuste fino especializado en tool calling y function calling desarrollado por el usuario solomoniw sobre la arquitectura MiniCPM5-1B. Esta versión concreta la publica Unluckkie y su valor diferencial no está en el modelo base, sino en el proceso de cuantización: utiliza una matriz de importancia (imatrix) calibrada específicamente sobre esquemas de herramientas y llamadas JSON, en lugar de sobre texto genérico, para preservar la sintaxis y la lógica de enrutamiento de funciones que definen al modelo.

El resultado es un modelo de aproximadamente 1.080 millones de parámetros (1B) empaquetado en archivos de entre 0,8 y 1,0 GB según la cuantización, pensado para actuar como router local de agentes con latencia muy baja. Emplea las cuantizaciones IQK (`IQ4_KS`, `IQ5_KS`, `IQ6_K`) del fork `ik_llama.cpp`, lo que implica que no carga en `llama.cpp` estándar, Ollama ni LM Studio.

Su relevancia actual reside en la combinación de tamaño reducido, licencia Apache 2.0 y especialización en salidas estructuradas: permite desplegar un enrutador de herramientas fiable en hardware muy modesto (el autor lo construyó en un portátil con i5-8250U y 8 GB de RAM sin GPU dedicada), algo útil en pipelines agénticos donde el coste por llamada y la latencia importan más que la capacidad de razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en MiniCPM5-1B (detalles internos de capas y atencion no disponibles) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_KS (~0,8 GB), IQ5_KS (~0,9 GB), IQ6_K (~1,0 GB); tambien existe el F16 de origen (~2,3 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variantes IQK compatibles con ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente, CallForge-1B-v2, es un ajuste fino de MiniCPM5-1B orientado de forma casi exclusiva a tool calling y function calling. La model card del repositorio de cuantización no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información correspondería al repositorio del modelo base y no está disponible en la documentación consultada. Lo que sí se documenta es el propósito del ajuste: generar objetos JSON válidos que respeten esquemas de herramientas y enrutar correctamente la función adecuada.

La innovación técnica de esta publicación no está en el entrenamiento sino en la cuantización. El autor generó una imatrix con `llama-imatrix --chunks 200` sobre un conjunto de calibración propio (`tools_calibration.txt`) compuesto por esquemas de herramientas y llamadas a funciones, en lugar de texto genérico. Esto hace que el algoritmo de cuantización asigne más bits a los pesos responsables de emitir JSON sintácticamente correcto y de seleccionar la función adecuada. La herramienta empleada es `llama-quantize --imatrix` del fork `ik_llama.cpp` de ikawrakow. El repositorio incluye `imatrix.dat` y `tools_calibration.txt` para reproducir o ampliar el barrido de cuantizaciones.

## Capacidades

- Generación de llamadas a herramientas en formato JSON conforme al esquema declarado en la petición (tool calling / function calling nativo).
- Enrutamiento de funciones: selección de la herramienta correcta a partir de la consulta del usuario y del conjunto de herramientas disponibles.
- Integración con la API de tool calling compatible con OpenAI a través de `llama-server` con la opción `--jinja`, devolviendo `finish_reason: "tool_calls"`.
- Generación de texto conversacional básico (pipeline `text-generation`, tag `conversational`).
- Capacidad multilingüe: limitada al inglés según el campo `language` del repositorio.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito (thinking) ni matemáticas avanzadas.

## Casos de uso

- Router de herramientas en agentes locales: el modelo recibe la consulta del usuario y el catálogo de funciones disponibles y devuelve la llamada JSON correcta; su tamaño de 1B y su latencia baja lo hacen adecuado como primera etapa de un pipeline agéntico que derive a modelos mayores solo cuando sea necesario.
- Automatización de asistentes de voz o chat en dispositivos de borde: con la cuantización IQ4_KS (~0,8 GB) puede ejecutarse en equipos con ~2 GB de RAM, lo que permite integrarlo en Raspberry Pi o mini-PC para interpretar intenciones y emitir llamadas a APIs locales.
- Enrutamiento de peticiones en backends de microservicios: dado un conjunto de endpoints descritos como herramientas, el modelo traduce lenguaje natural a la llamada de API correspondiente, reduciendo el código de parseo manual.
- Agentes de automatización de escritorio o RPA: interpretar órdenes como "abre el informe de ventas de marzo" y mapearlas a funciones concretas (abrir archivo, filtrar por fecha) manteniendo la estructura JSON que espera el orquestador.
- Clasificación y extracción estructurada: reutilizar su especialización en JSON para tareas de extracción de campos con esquema fijo (formularios, tickets, registros) en lugar de texto libre.
- Prototipado rápido de asistentes con tool calling en local: al requerir solo `ik_llama.cpp` y unos pocos GB de RAM, sirve para validar diseños de esquemas de herramientas y flujos agénticos antes de escalar a modelos mayores.
- Filtro previo en sistemas multiagente: decidir qué subagente o herramienta debe atender una consulta antes de invocar un modelo de mayor tamaño, reduciendo coste y latencia global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~2 GB de RAM con IQ4_KS, ~3 GB con IQ5_KS y ~4 GB con IQ6_K, según las indicaciones del autor (cifras de memoria del sistema, no solo de pesos).
- GPU recomendadas: no se especifican; el autor generó las cuantizaciones en CPU (i5-8250U, 8 GB de RAM, sin GPU dedicada), lo que indica que la inferencia en CPU es viable.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2-4 GB de VRAM libre puede alojar los pesos, aunque no se han publicado medidas de rendimiento en GPU.
- Opciones de despliegue: exclusivamente `ik_llama.cpp` (`llama-server` con `--jinja`). No carga en `llama.cpp` estándar, Ollama ni LM Studio. Existe una alternativa de cuantizaciones GGUF estándar en `mradermacher/CallForge-1B-v2-GGUF` para esos entornos.
- Latencia y throughput: no disponibles. El autor describe el modelo como "lightning-fast" y adecuado para dispositivos de borde, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formatos |
|---|---|---|---|---|---|
| CallForge-1B-v2-IK-GGUF (esta ficha) | ~1,08 B | no disponible | Tool calling con imatrix calibrada en JSON | Apache 2.0 | GGUF IQK (solo ik_llama.cpp) |
| CallForge-1B-v2 (base, solomoniw) | ~1,08 B | no disponible | Tool calling | Apache 2.0 | safetensors / F16 GGUF |
| mradermacher/CallForge-1B-v2-GGUF | ~1,08 B | no disponible | Tool calling, cuantizacion estandar | Apache 2.0 | GGUF estandar (llama.cpp, Ollama) |
| MiniCPM5-1B (modelo original) | ~1 B | no disponible | Modelo generalista | no disponible en la informacion consultada | safetensors |

La comparación se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Compatibilidad restringida: las cuantizaciones IQK (`IQ4_KS`, `IQ5_KS`, `IQ6_K`) no cargan en `llama.cpp` estándar, Ollama ni LM Studio; requieren `ik_llama.cpp`.
- Muestreo crítico: es obligatorio fijar `min_p = 0.0`. Con el valor por defecto (habitualmente 0,05) el modelo produce bucles numéricos o texto incoherente en lugar de JSON, según advierte el autor.
- Tool calling nativo: requiere `llama-server` con la opción `--jinja`; sin ella no se activa el manejo del esquema de herramientas.
- Idioma: solo inglés declarado; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto: no documentada, lo que impide planificar su uso en conversaciones o esquemas de herramientas extensos.
- Riesgo de alucinación: inherente a un modelo de 1B; el ajuste mitiga errores de sintaxis JSON, pero no garantiza la corrección semántica de los argumentos ni la elección de la herramienta en casos ambiguos.
- Sesgos: no se documenta ningún análisis de sesgos del modelo base ni de las cuantizaciones.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base MiniCPM5-1B, que no está disponible en la información consultada.
- Madurez: el repositorio tiene 157 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (3 de noviembre de 2026), lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Unluckkie/CallForge-1B-v2-IK-GGUF
- Modelo base: https://huggingface.co/solomoniw/CallForge-1B-v2
- Cuantizaciones GGUF estándar (mradermacher): https://huggingface.co/mradermacher/CallForge-1B-v2-GGUF
- Herramienta de cuantización ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
