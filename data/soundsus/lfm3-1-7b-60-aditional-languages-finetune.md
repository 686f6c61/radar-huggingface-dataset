# Soundsus/LFM3-1.7B-60-Aditional-Languages-Finetune

## Resumen

LFM3-1.7B-60-Aditional-Languages-Finetune es una conversión a formato GGUF de un modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario Soundsus. El nombre del repositorio y de los ficheros de pesos sugieren que se trata de un ajuste fino orientado a ampliar la cobertura idiomática del modelo base mediante entrenamiento continuado (CPT) sobre textos de Wikipedia en múltiples idiomas, aunque la model card no documenta el proceso de entrenamiento ni los idiomas concretos cubiertos.

El modelo base pertenece a la familia LFM3 de Liquid AI, una arquitectura que combina capas convolucionales y mecanismos de atención, si bien esta ficha no puede confirmar los detalles arquitectónicos exactos al no estar documentados en la información disponible. El repositorio se distribuye exclusivamente en cuantizaciones GGUF para su uso con llama.cpp, con versiones desde Q2_K_L hasta Q8_0.

Su relevancia es limitada y experimental: se trata de una publicación sin descargas ni interacciones, sin licencia declarada y sin resultados de evaluación. Resulta útil únicamente como artefacto de prueba para quienes quieran experimentar con un modelo pequeño multilingüe en llama.cpp, no como una opción recomendada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3; detalles no documentados) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible (el nombre indica "60 Additional Languages", sin listado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversión realizada con Unsloth) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LFM3, más allá de que pertenece a la familia LFM3 de Liquid AI y de que el repositorio incluye código personalizado (`custom_code`), lo que sugiere que la arquitectura requiere implementaciones específicas para su carga. El tamaño de 1.728 millones de parámetros es coherente con un modelo denso de pequeña escala.

El nombre del repositorio y de los ficheros (`CPT-Wikipedia-Languages`) apunta a un entrenamiento continuado sobre corpus de Wikipedia en varios idiomas, presumiblemente para reforzar competencias multilingües. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste supervisado o preferencias (RLHF/DPO). La conversión a GGUF se realizó con las herramientas de Unsloth, pero no se especifican los parámetros de cuantización más allá de la nomenclatura estándar de llama.cpp.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Soporte de plantilla de chat compatible con llama.cpp mediante el flag `--jinja`.
- Cobertura multilingüe potencialmente ampliada respecto al modelo base, según indica el nombre del repositorio (sin listado verificable de idiomas).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite su despliegue en infraestructuras compatibles con la API de Hugging Face.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Pruebas de inferencia local en llama.cpp: el modelo puede cargarse con `llama-cli -hf Soundsus/LFM3-1.7B-60-Aditional-Languages-Finetune --jinja` para validar el pipeline de cuantización y la plantilla de chat en un entorno de desarrollo.
- Experimentación con multilingüismo de bajo coste: dado su tamaño reducido y las cuantizaciones Q2/Q3, permite probar generación de texto en idiomas poco cubiertos por modelos pequeños en hardware modesto, aunque sin garantías de calidad.
- Evaluación comparativa de cuantizaciones: al ofrecer cinco niveles de cuantización, sirve para medir la degradación de calidad y el ahorro de memoria entre Q2_K_L y Q8_0 en un mismo modelo.
- Prototipado de asistentes conversacionales offline: su formato GGUF y su plantilla de chat permiten integrarlo en aplicaciones de escritorio o embebidas que no pueden depender de APIs externas.
- Docencia y formación: útil como ejemplo práctico de conversión de pesos con Unsloth y despliegue con llama.cpp en cursos de IA open source.
- Pruebas de integración en endpoints compatibles: la etiqueta `endpoints_compatible` permite validar flujos de despliegue gestionado con un modelo de 1,7B de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización): Q2_K_L en torno a 1 GB; Q3_K_M en torno a 1,3 GB; Q4_K_M en torno a 1,6 GB; Q5_K_M en torno a 1,9 GB; Q8_0 en torno a 2,5 GB, más overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M o superior; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen holgado. Para Q8_0 con contextos largos, se recomienda 6-8 GB.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa importación del GGUF), y servidores compatibles con la API de Hugging Face por la etiqueta `endpoints_compatible`. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-60-Aditional-Languages-Finetune | 1,73B | no disponible | no disponible | GGUF | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face (ampliamente adoptado) |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face (ampliamente adoptado) |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face (ampliamente adoptado) |

La comparativa se limita a parámetros, contexto, licencia y disponibilidad, ya que no hay benchmarks publicados para el modelo de Soundsus. Frente a las alternativas, la principal desventaja es la ausencia de licencia declarada y de documentación, lo que complica su adopción frente a modelos con licencias permisivas y ecosistemas consolidados.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, lo que impide asumir permisos de explotación en producción.
- Sin resultados de evaluación: no hay benchmarks que permitan estimar la calidad real del ajuste multilingüe.
- Idiomas no documentados: el nombre menciona "60 Additional Languages" pero no se lista ninguno, por lo que no se puede verificar la cobertura real.
- Riesgo de alucinación: inherente a modelos de 1,7B sin evaluación publicada; la cuantización Q2_K_L agrava la degradación de calidad.
- Contexto desconocido: no se documenta la ventana de contexto, lo que dificulta planificar casos de uso con entradas largas.
- Repositorio sin tracción: cero descargas y cero interacciones, sin garantía de mantenimiento ni soporte del autor.
- Arquitectura con código personalizado: requiere versiones de llama.cpp compatibles con la implementación específica de LFM3, lo que puede generar problemas de portabilidad.
- Ausencia de información sobre sesgos: no se documentan sesgos conocidos ni medidas de mitigación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soundsus/LFM3-1.7B-60-Aditional-Languages-Finetune
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
