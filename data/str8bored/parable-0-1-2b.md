# str8bored/Parable-0.1-2B

## Resumen

Parable 0.1 es un ajuste fino por LoRA fusionada del modelo LiquidAI/LFM3-1.7B-Base, desarrollado por el usuario str8bored y publicado en Hugging Face bajo el identificador `str8bored/Parable-0.1-2B`. A pesar del sufijo "2B" en el nombre del repositorio, el modelo conserva los aproximadamente 1.728 millones de parámetros del modelo base LFM3-1.7B; el "2B" hace referencia a la clase del proyector multimodal (mmproj) que lo acompaña, no al número de parámetros del modelo de lenguaje.

El modelo se distribuye exclusivamente como GGUF cuantizado en Q4_K_M (unos 1,0 GB) junto con un proyector multimodal F16 de aproximadamente 0,35 GB, lo que permite entrada de imagen y texto. Mantiene la ventana de contexto de 262.144 tokens del modelo padre y el modo de razonamiento ("thinking") activado. Su entrenamiento se centró en un conjunto de datos pequeño y deliberadamente heterogéneo que incluye HTML/JavaScript, texto bíblico (red.txt), motores de animación de píxeles, fórmulas de atención de transformers y documentos PDF/LaTeX.

Es relevante para desarrolladores que buscan un modelo de borde (edge) ligero, rápido (más de 100 tok/s según el autor), con contexto muy largo y capacidades de generación de código front-end, pero debe tratarse como un experimento de ajuste fino con evaluación únicamente autoinformada, sin benchmarks públicos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B-Base; detalles de atención no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); entrenamiento posterior en 16 bits |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF (`parable0.1-2b-q4.gguf` + `mmproj-parable0.1-2b-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B-Base de LiquidAI y aplica un ajuste fino mediante LoRA que posteriormente se fusiona con los pesos base. El entrenamiento posterior se realizó en precisión de 16 bits sobre un conjunto de datos propietario denominado `str8bored/RED.TXT`, compuesto por cinco dominios: marcado HTML y scripts JavaScript reales, texto bíblico (versículos y escrituras), motores de animación de píxeles (lógica de sprites y estados discretos), fórmulas de atención de transformers (QKV, softmax, cabezas) y documentos PDF/LaTeX con ecuaciones. No se especifica el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

La innovación principal declarada es de comportamiento más que arquitectónica: el autor afirma que el ajuste produce respuestas más exhaustivas en tareas de investigación y código, con mayor tendencia a completar el trabajo ("terminar el HTML", "verificar la cita") en comparación con LFM3-1.7B estándar en la misma cuantización, manteniendo la velocidad de decodificación de la familia LFM3. No se documentan técnicas como decodificación especulativa o atención lineal específicas de este ajuste.

## Capacidades

- Generación de texto conversacional con modo de razonamiento ("thinking") activado por defecto.
- Generación de código front-end: HTML y JavaScript funcional, según el autor.
- Entrada multimodal imagen-texto mediante el proyector mmproj F16 (pipeline `image-text-to-text`).
- Razonamiento paso a paso con deliberación visible, orientado a investigación y documentos técnicos.
- Procesamiento de documentos PDF y LaTeX (ecuaciones y maquetación) según los datos de entrenamiento.
- Contexto largo de 262.144 tokens para sesiones multi-turno y lectura de documentos extensos.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes multi-paso: no disponible (no se menciona explícitamente).
- Capacidades multilingües: solo inglés declarado.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente local de programación front-end: el modelo puede generar y completar componentes HTML y JavaScript funcionales, adecuado para prototipado rápido en entornos de desarrollo locales gracias a su tamaño reducido y velocidad de decodificación superior a 100 tok/s.
- Sesiones de contexto largo: con 262.144 tokens de ventana, puede ingerir varios archivos de código o documentación extensa y responder preguntas sobre ellos sin truncar el contexto, útil para revisión de repositorios o análisis de notas.
- Asistente de borde en portátil o dispositivo móvil: al distribuirse como GGUF Q4_K_M de aproximadamente 1 GB, cabe en equipos con recursos limitados y puede ejecutarse con llama.cpp, lo que lo hace apto para asistentes offline en hardware de consumo.
- Generación de documentación técnica con LaTeX: entrenado con PDF y LaTeX, puede redactar borradores de documentación con ecuaciones y maquetación, útil para informes técnicos o apuntes académicos.
- Razonamiento visible en flujos de investigación: el modo thinking permite mostrar la deliberación paso a paso, adecuado para herramientas educativas o de depuración de razonamiento donde el usuario quiere ver el proceso.
- Análisis de imágenes con texto: mediante el proyector multimodal, puede describir o razonar sobre imágenes acompañadas de instrucciones textuales, por ejemplo para anotar capturas de interfaz o diagramas.
- Experimentación con ajustes finos especializados: sirve como caso de estudio de LoRA fusionada sobre LFM3 para investigadores que quieran replicar el pipeline con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara comparaciones autoinformadas frente a LFM3-1.7B estándar en la misma cuantización (Q4) y temperatura 0,7, sin métricas numéricas ni conjuntos de evaluación formales. Las afirmaciones incluyen mayor exhaustividad en investigación y código, capacidad de detenerse sin bucles infinitos con repeat-penalty 1,05, y velocidad de más de 100 tok/s en el mismo hardware que LFM3-1.7B, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB para los pesos Q4_K_M más el proyector F16 de unos 0,35 GB; con overhead de contexto y KV cache, se recomienda al menos 2-4 GB de VRAM para contextos moderados.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090); también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas de gama media y alta; también en equipos de borde y portátiles.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con endpoint compatible con OpenAI); otras herramientas compatibles con GGUF como Ollama o LM Studio no se mencionan explícitamente pero son viables por formato.
- Latencia y throughput estimados: más de 100 tok/s según el autor en el mismo entorno local que LFM3-1.7B, dependiente del hardware; no se proporcionan cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parable 0.1 2B | 1,73 B | 262.144 | lfm1.0 | GGUF Q4_K_M | Ajuste fino LoRA de LFM3-1.7B; multimodal con mmproj; solo inglés |
| LiquidAI/LFM3-1.7B | 1,7 B | 262.144 | lfm1.0 | safetensors, GGUF | Modelo base; sin el ajuste de comportamiento ni el proyector multimodal específico |
| Modelos de ~1-2 B de la familia Qwen o Llama | ~1-2 B | variable | variable | safetensors, GGUF | Alternativas de tamaño similar; datos de rendimiento comparativo no disponibles en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Evaluación únicamente autoinformada por el autor, sin benchmarks públicos ni revisión por pares; las afirmaciones de mejora deben tomarse con cautela.
- Entrenado exclusivamente en inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- El ajuste se realizó en 16 bits pero se distribuye en Q4_K_M, por lo que puede haber pérdida de calidad respecto al modelo entrenado.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en tareas de investigación o citas; el autor advierte explícitamente contra su uso en medicina, derecho o finanzas.
- El conjunto de datos incluye texto bíblico, lo que puede introducir sesgos temáticos o de tono en las respuestas.
- Licencia lfm1.0: es necesario revisar los términos del archivo LICENSE del repositorio para uso comercial; la model card la etiqueta como "other".
- El nombre del repositorio ("2B") no refleja el número real de parámetros del modelo de lenguaje (1,73 B), lo que puede confundir en la selección de hardware.
- Sin soporte documentado de tool calling ni de flujos de agentes multi-paso, lo que limita su uso en pipelines automatizados complejos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/str8bored/Parable-0.1-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base (variante Base): https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Conjunto de datos: https://huggingface.co/datasets/str8bored/RED.TXT
- Licencia: archivo LICENSE en el repositorio de Hugging Face
