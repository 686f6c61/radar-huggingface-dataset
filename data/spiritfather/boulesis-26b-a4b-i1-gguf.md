# spiritfather/Boulesis-26B-A4B-i1-GGUF

## Resumen

Boulesis-26B-A4B-i1-GGUF es una colección de cuantizaciones GGUF con imatrix del modelo Boulesis-26B-A4B, un merge experimental creado por SubMaroon sobre el modelo base google/gemma-4-26B-A4B-it de Google. El modelo original está diseñado específicamente para escritura creativa y roleplay (RP), y combina circuitos de atención de varios modelos, incluyendo enrutamiento QK de Pantheon-Reasoning-1.1, una cabeza de estilo trasplantada de StyleTune-V2 y una LoRA narrativa de RP sobre la base coder3101. El cuantizador spiritfather ha preparado cuatro cuantizaciones i1 (imatrix) que heredan la licencia Gemma y están pensadas para ejecutarse en llama.cpp.

La arquitectura es un modelo de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos por token. La longitud de contexto utilizada en el comando de ejemplo es de 32.768 tokens. Se trata de un modelo puramente de texto, sin capacidades de visión o audio, optimizado para narrativa y conversación creativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre base Gemma-4 |
| Parametros totales | 25.971.339.550 |
| Parametros activos | 4B (según nomenclatura A4B) |
| Longitud de contexto | 32.768 tokens (según comando de ejemplo en la model card) |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible (el modelo base Gemma-4 es multilingüe, pero no se especifican idiomas en esta cuantización) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix) |

## Arquitectura y entrenamiento

Boulesis-26B-A4B es un merge experimental, no un modelo entrenado desde cero. El autor SubMaroon tomó el modelo base Gemma-4-26B-A4B-it de Google y le injertó circuitos de atención de otros modelos: enrutamiento QK de Pantheon-Reasoning-1.1, una cabeza de estilo de StyleTune-V2 y una LoRA narrativa de RP, todo sobre la base modificada coder3101. El resultado es un modelo de 26B con 4B de parámetros activos, lo que permite una inferencia relativamente rápida en comparación con un modelo denso del mismo tamaño.

El proceso de cuantización fue realizado por spiritfather. Se convirtieron los safetensors originales a GGUF bf16 con la herramienta convert_hf_to_gguf.py de llama.cpp y luego se aplicó llama-quantize. Para las cuantizaciones i1 se calculó una matriz de importancia (imatrix) sobre el dataset de calibración bartowski calibration_datav3, de modo que los bits se distribuyen según la sensibilidad del modelo a cada parte del texto. No se menciona ningún proceso de alineación adicional como RLHF o DPO.

## Capacidades

- Generación de texto creativo y narrativo: el modelo está específicamente optimizado para prosa, diálogos y roleplay.
- Roleplay con personajes: soporta conversaciones multi-turno con estilo y personalidad coherentes.
- Modo de pensamiento (thinking): activado por defecto, permite razonamiento interno antes de responder. Se puede desactivar por petición o por configuración del servidor.
- Contexto largo: soporta ventanas de hasta 32.768 tokens, adecuado para historias y conversaciones extensas.
- Soporte de plantilla de chat de Gemma-4: el GGUF incluye una plantilla corregida que añade el canal de pensamiento en la ruta de thinking, algo que la plantilla original del autor omitía.
- Tool calling: no documentado en la información disponible.
- Capacidades de visión o audio: no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Escritura de ficción interactiva: el modelo puede generar narrativas ramificadas manteniendo coherencia argumental a lo largo de múltiples turnos gracias a su ventana de contexto de 32K.
- Roleplay en juegos de texto: ideal para crear NPCs con personalidades definidas; el modo thinking permite al modelo planificar respuestas más naturales y matizadas.
- Asistente de escritura creativa: útil para generar borradores de novelas, descripciones de escenarios o diálogos, con un estilo literario cuidado.
- Simulación de personajes para investigación narrativa: permite explorar cómo respondería un personaje ficticio en situaciones hipotéticas, útil para escritores y guionistas.
- Generación de contenido para juegos de rol de mesa: el modelo puede actuar como director de juego o narrar eventos y descripciones de entorno en tiempo real.
- Creación de guiones y diálogos para videojuegos: la capacidad de mantener tono y estilo a lo largo de conversaciones largas lo hace apto para diálogos de personajes en juegos narrativos.
- Chat conversacional creativo: sirve como asistente en aplicaciones de entretenimiento donde se busca una experiencia de conversación inmersiva y no factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una puntuación en CaliperBench, un benchmark de escritura creativa que evalúa prosa, roleplay y disposición en lugar de inteligencia general, pero no se incluyen las cifras concretas en la documentación proporcionada. Por tanto, no se puede presentar una tabla de resultados comparativos.

## Requisitos de hardware

- VRAM estimada según cuantización:
  - IQ4_XS: aproximadamente 14.3 GB.
  - Q4_K_M: aproximadamente 17.2 GB.
  - Q5_K_M: aproximadamente 19.6 GB.
  - Q6_K: aproximadamente 23.2 GB.
  - Hay que añadir memoria adicional para la caché KV y el overhead de la GPU.
- GPU recomendadas: una RTX 3090 o RTX 4090 de 24 GB puede ejecutar Q4_K_M y Q5_K_M con contexto 32K de forma cómoda; Q6_K también cabe, aunque con margen más ajustado. Para mayor margen se recomiendan A100 o H100 de 80 GB.
- Consumer GPU: sí, es viable en GPUs de 24 GB para la mayoría de cuantizaciones; en GPUs de 16 GB se podría probar IQ4_XS, pero el contexto largo podría quedar limitado.
- Opciones de despliegue: llama.cpp es la opción principal, mediante llama-server. También es compatible con Ollama u otras herramientas que carguen GGUF. El comando recomendado es: `llama-server -m Boulesis-26B-A4B.i1-Q4_K_M.gguf -ngl 99 -fa on -c 32768 -ctk q8_0 -ctv q8_0 --jinja --no-reasoning-preserve`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Boulesis-26B-A4B-i1-GGUF | 26B (4B activos) | 32.768 tokens | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K | Gemma | Cuantizaciones imatrix con plantilla de chat corregida |
| google/gemma-4-26B-A4B-it | 26B (4B activos) | no disponible | no aplica | Gemma | Modelo base original de Google, sin cuantizar |
| SubMaroon/Boulesis-26B-A4B-GGUF | 26B (4B activos) | no disponible | estáticas | Gemma | Cuantizaciones estáticas del mismo merge, sin imatrix |

## Limitaciones y advertencias

- Modelo experimental: al ser un merge sin entrenamiento formal desde cero, puede presentar comportamientos inconsistentes o alucinaciones más frecuentes que un modelo base afinado.
- Licencia Gemma: hereda los términos de uso de Google, que imponen restricciones a determinados usos y obligan a cumplir sus políticas. Es recomendable revisar la licencia antes de usar en producción.
- Modo thinking: si no se usa la plantilla de chat corregida y la opción `--no-reasoning-preserve`, el modelo puede devolver contenido vacío o releer sus propios pensamientos anteriores, generando respuestas incoherentes en conversaciones multi-turno.
- Sesgos y seguridad: no se han publicado evaluaciones de sesgos ni de seguridad. Al estar orientado a roleplay, puede generar contenido no deseado o inapropiado sin filtros adicionales.
- Idiomas: aunque el modelo base Gemma-4 es multilingüe, la información de esta cuantización no especifica los idiomas soportados ni garantiza un rendimiento uniforme.
- Tool calling: no documentado, por lo que no debe asumirse soporte de funciones externas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spiritfather/Boulesis-26B-A4B-i1-GGUF
- Modelo original: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Cuantizaciones estáticas: https://huggingface.co/spiritfather/Boulesis-26B-A4B-GGUF
- Modelo base de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Benchmark CaliperBench: https://caliperbench.com/m/boulesis-26b-a4b/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Gist de calibración de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
