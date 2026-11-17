# SushmithaJujare/shell-buddy-GGUF

## Resumen

Shell Buddy es un modelo de lenguaje de 494 millones de parámetros especializado en la traducción de instrucciones en inglés a comandos de shell de Linux. Se obtiene mediante un ajuste fino con LoRA sobre Qwen2.5-0.5B-Instruct, el modelo instructivo compacto de la familia Qwen2.5 de Alibaba, y se distribuye cuantizado en formato GGUF de 8 bits (q8_0) con un tamaño de repositorio de 0,5 GB. La motivación principal es ofrecer una herramienta ligera que pueda ejecutarse en la CPU de un portátil convencional sin necesidad de GPU.

El modelo no introduce arquitectura propia: hereda el transformer decoder-only denso de Qwen2.5-0.5B-Instruct, con un contexto nativo de 32.768 tokens según la documentación del modelo base. La contribución del autor se limita al ajuste fino supervisado sobre aproximadamente 10.800 pares inglés-bash extraídos y depurados del dataset NL2Bash, seguido de la fusión de adaptadores y la conversión a GGUF con llama.cpp.

Su relevancia actual reside en el nicho: demuestra que un modelo de medio billón de parámetros, ajustado de forma específica, puede superar ampliamente a modelos mucho mayores en una tarea acotada. La model card reporta un 91% de acierto en la elección de la herramienta correcta frente al 62-63% de Qwen2.5-0.5B sin ajustar y de un Qwen de 7B sin ajustar, sobre 100 ejemplos no vistos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-0.5B-Instruct) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens) |
| Tipos de cuantización | GGUF q8_0 (8 bits); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Dataset de ajuste | AnishJoshi/nl2bash-custom (~10.800 pares inglés-bash depurados de NL2Bash) |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atención de causalidad completa, normalización RMSNorm y las innovaciones estándar de la familia Qwen2 (RoPE para codificación posicional y atención con query-key normalization, según la documentación pública del modelo base). No hay mezcla de expertos, ni atención lineal, ni capas SSM: es un modelo denso convencional de 24 capas y dimensión oculta de 896, aunque estos detalles concretos no se explicitan en la información proporcionada y se corresponden con la ficha pública de Qwen2.5-0.5B.

El entrenamiento consistió en un ajuste fino supervisado con LoRA sobre aproximadamente 10.800 pares de instrucción en inglés y comando bash, limpiados a partir del dataset NL2Bash. El ajuste se ejecutó en una GPU gratuita de Google Colab, lo que sugiere un coste computacional muy reducido. Posteriormente, los adaptadores se fusionaron con los pesos base y el modelo resultante se convirtió a GGUF con cuantización q8_0 mediante llama.cpp. No se documenta en la información disponible el uso de RLHF, DPO, ni una fase de alineación adicional más allá del propio ajuste supervisado. Tampoco se detalla la composición exacta del dataset más allá de su origen en NL2Bash y su sesgo hacia el comando `find`.

## Capacidades

- Generación de comandos de shell de Linux a partir de descripciones en inglés, con salida de un único comando como formato esperado.
- Traducción de intenciones de alto nivel ("find all files bigger than 1GB in my home folder") a invocaciones concretas con flags y rutas.
- Uso como modelo conversacional de un solo turno: la etiqueta `conversational` y su base instructiva permiten formatear la petición como diálogo, aunque el ajuste está orientado a la respuesta directa.
- Ejecución local en CPU mediante llama.cpp u Ollama, sin dependencia de GPU.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` según las etiquetas del repositorio).
- Capacidad multilingüe: limitada al inglés como idioma de entrada; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Asistente de terminal para desarrolladores: el modelo traduce una descripción en lenguaje natural a un comando bash que el usuario revisa antes de ejecutar, integrable en un plugin de shell o en un alias que invoque a Ollama. Es adecuado por su latencia baja en CPU y su tamaño de 531 MB.
- Documentación interactiva de operaciones de sistema: generar ejemplos de comandos `find` con criterios de tamaño, fecha o permisos para guías técnicas, aprovechando que el corpus de entrenamiento está dominado por ese comando.
- Formación y onboarding: mostrar a usuarios noveles la correspondencia entre una intención y el comando equivalente, con la advertencia de revisar siempre la salida antes de ejecutarla.
- Automatización de scripts de mantenimiento: proponer comandos de búsqueda y limpieza de ficheros en entornos de CI o contenedores, donde el modelo puede ejecutarse sin GPU junto al runner.
- Prototipado de interfaces de lenguaje natural para herramientas CLI: servir como motor de un front-end experimental que convierta peticiones en comandos antes de validarlos con un parser o un shell en modo `--dry-run`.
- Evaluación comparativa de ajuste fino: usar el modelo como referencia de hasta dónde llega un ajuste LoRA sobre una base de 0,5B en una tarea estrecha, útil en investigación sobre eficiencia de adaptación.
- Despliegue en dispositivos con recursos muy limitados: portátiles sin GPU, Raspberry Pi o entornos de borde donde un modelo de 7B no cabría, gracias a la cuantización q8_0 de 531 MB.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 100 ejemplos no vistos (según la model card):

| Modelo | Herramienta correcta elegida | Coincidencia exacta |
|---|---|---|
| Qwen 0.5B base (sin ajustar) | 62% | 5% |
| Qwen 7B (14× mayor, sin ajustar) | 63% | 9% |
| Shell Buddy (0.5B, ajustado, 8 bits) | 91% | 18% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La métrica de coincidencia exacta del 18% indica que, aunque el modelo elige bien la herramienta, la formulación exacta del comando dista de ser fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; en GPU, la cuantización q8_0 de 531 MB requiere menos de 1 GB de VRAM, más el espacio para el contexto.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo está pensado para CPU y no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), aunque su diseño objetivo es la ejecución en CPU.
- Opciones de despliegue: llama.cpp, Ollama (comando documentado: `ollama run hf.co/SushmithaJujare/shell-buddy-GGUF`), y cualquier runtime compatible con GGUF. vLLM y TGI no se documentan para este formato en la información disponible.
- Latencia y throughput estimados: no disponibles. El autor indica que se ejecuta en la CPU de un portátil convencional, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ajuste específico bash | Licencia | Formato | Rendimiento reportado (herramienta correcta) |
|---|---|---|---|---|---|---|
| Shell Buddy (este modelo) | 0,49B | no disponible (base: 32.768) | Sí (LoRA sobre NL2Bash) | Apache 2.0 | GGUF q8_0 | 91% |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | No | Apache 2.0 | safetensors, GGUF | 62% (en la misma evaluación) |
| Qwen 7B (sin ajustar) | ~7B | no disponible | No | no disponible | no disponible | 63% (en la misma evaluación) |

No se dispone de información sobre otros modelos especializados en NL2Bash comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo puede equivocarse y que debe leerse siempre el comando antes de ejecutarlo; no debe usarse para ejecución automática sin supervisión.
- La coincidencia exacta es baja (18%): aunque la herramienta elegida sea correcta, los flags y la sintaxis pueden diferir de la respuesta esperada.
- Sesgo de datos: el corpus está dominado por `find`, lo que degrada el rendimiento en comandos cotidianos como `pwd`, `df -h` o `du`, según reconoce la model card.
- Idioma: solo se declara inglés; no hay evidencia de soporte para instrucciones en castellano u otros idiomas.
- Riesgo de alucinación de flags o rutas inexistentes, especialmente fuera del dominio de `find`.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste; el modelo base soporta 32.768 tokens, pero el ajuste se realizó sobre pares cortos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Repositorio con 0 descargas y creado en noviembre de 2026 según los metadatos: ecosistema de validación muy limitado, sin evidencia de uso en producción.
- No se documentan evaluaciones de seguridad, sesgos sociales ni robustez frente a entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SushmithaJujare/shell-buddy-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/AnishJoshi/nl2bash-custom
- llama.cpp (conversión a GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado en la información disponible papers, blogs ni demos adicionales del autor.
