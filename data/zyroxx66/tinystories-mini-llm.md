# Zyroxx66/tinystories-mini-llm

## Resumen

TinyStories Mini-LLM es un modelo de lenguaje pequeño, tipo transformer decoder-only, desarrollado por Zyroxx66 y entrenado desde cero sobre el dataset TinyStories, un corpus de cuentos infantiles en inglés. Con aproximadamente 6,2 millones de parámetros, está diseñado para generar historias cortas y coherentes para niños, sirviendo como base de experimentación en eficiencia, entrenamiento desde cero y comprensión de arquitecturas modernas a escala reducida.

El modelo incorpora técnicas actuales como RoPE, RMSNorm, SwiGLU, atención con flash memory (SDPA) y embeddings atados, lo que lo convierte en un ejemplo didáctico de cómo construir un LLM funcional con recursos mínimos. Su relevancia actual radica en la tendencia hacia modelos compactos que puedan ejecutarse en dispositivos de bajo coste, así como en la investigación sobre el impacto de la escala en la calidad generativa.

Aunque su tamaño es minúsculo comparado con los LLM convencionales, demuestra que es posible obtener resultados razonables en tareas muy acotadas con una fracción de los recursos habituales. No obstante, su ventana de contexto de 256 tokens y su entrenamiento exclusivo en cuentos infantiles limitan su aplicabilidad a dominios específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo GPT) |
| Parametros totales | 5.758.208 (~6,2 M) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (no se especifica si safetensors o bin) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 6 capas, dimensión de embedding de 256 y 8 cabezas de atención. Incorpora normalización RMSNorm, activación SwiGLU en las capas feed-forward, posiciones rotativas (RoPE) y embeddings de token atados entre entrada y salida. La atención utiliza SDPA (Scaled Dot-Product Attention) con soporte de Flash Attention, lo que optimiza el uso de memoria durante el entrenamiento y la inferencia.

El vocabulario se construye con un tokenizador Byte-Level BPE de 4.096 tokens, suficiente para el corpus de cuentos infantiles. El entrenamiento se realizó desde cero sobre el dataset TinyStories, que contiene millones de historias simples en inglés. No se menciona el número exacto de tokens de entrenamiento ni el uso de técnicas de alineación como RLHF o DPO. El autor indica que el modelo fue entrenado y subido mediante un pipeline automatizado, lo que sugiere un proceso reproducible pero sin detalles adicionales sobre hiperparámetros o duración.

## Capacidades

- Generación de texto narrativo corto: produce cuentos infantiles coherentes y con estructura básica (inicio, desarrollo y desenlace) a partir de un prompt inicial.
- Comprensión limitada de instrucciones simples: puede continuar historias o responder a peticiones sencillas dentro del dominio de cuentos.
- Modelado de lenguaje básico: captura patrones sintácticos y semánticos elementales del inglés infantil.
- No soporta tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No es multilingüe; solo procesa texto en inglés.
- No incluye visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Generación de cuentos personalizados para niños: el modelo puede crear historias breves a partir de un personaje o escenario dado, útil en aplicaciones educativas o de entretenimiento infantil.
- Prototipado rápido de aplicaciones de generación de texto: su pequeño tamaño permite iterar con rapidez en entornos de desarrollo sin necesidad de GPUs potentes.
- Investigación en eficiencia de modelos: sirve como banco de pruebas para estudiar el impacto de la arquitectura y el entrenamiento en modelos de menos de 10 M de parámetros.
- Fine-tuning para tareas específicas de lenguaje infantil: al estar preentrenado en TinyStories, puede adaptarse a tareas como clasificación de sentimiento en cuentos o generación de preguntas de comprensión lectora.
- Enseñanza de arquitecturas transformer: es un ejemplo didáctico para estudiantes que quieran entender cómo funciona un LLM por dentro, dado su tamaño reducido y código accesible.
- Inferencia en dispositivos de bajo consumo: su reducido número de parámetros permite ejecutarlo en CPUs, microcontroladores o dispositivos edge para aplicaciones offline de narración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El único ejemplo de salida mostrado en la model card es una continuación de un cuento, sin métricas objetivas de calidad.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB en FP32 (6,2 M de parámetros × 4 bytes ≈ 24,8 MB), por lo que cabe en cualquier GPU moderna y también en memoria RAM de un ordenador convencional.
- GPU recomendada: cualquiera, incluso integradas; una CPU moderna es suficiente para inferencia en tiempo real.
- Compatible con consumer GPU: sí, todas las GPU de consumo pueden ejecutarlo sin problemas.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con herramientas como Hugging Face Transformers, o convertirse a formatos optimizados como ONNX o GGUF para ejecución con llama.cpp o similar.
- Latencia y throughput: al ser tan pequeño, la generación es casi instantánea en CPU; se estiman decenas de tokens por segundo en hardware básico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyStories Mini-LLM (Zyroxx66) | ~6,2 M | 256 | Decoder-only | MIT | Hugging Face |
| TinyStories LLM (NonsonoNicola) | ~40 M | No especificado | Decoder-only (inspirado en Mistral) | No especificada | GitHub |
| Mini-LLM (aman99dex) | No especificado | No especificado | GPT-like | No especificada | GitHub |

No se dispone de datos comparativos de rendimiento entre estos modelos. La comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Contexto muy limitado: 256 tokens impiden mantener coherencia en historias largas o manejar diálogos extensos.
- Dominio restringido: entrenado únicamente con cuentos infantiles en inglés, por lo que falla en temas técnicos, científicos o de otro registro lingüístico.
- Riesgo de alucinación: al ser un modelo pequeño, puede inventar nombres, objetos o eventos inconsistentes con el prompt.
- Sesgos del dataset: TinyStories refleja un estilo y vocabulario propios de literatura infantil, lo que puede no ser adecuado para otros contextos.
- Sin garantías de producción: no hay evidencia de pruebas exhaustivas ni de robustez frente a entradas maliciosas o fuera de distribución.
- Licencia MIT permite uso comercial, pero el autor no ofrece soporte ni mantenimiento.
- No se especifican cuantizaciones oficiales, por lo que el despliegue en formatos optimizados requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyroxx66/tinystories-mini-llm
- Dataset TinyStories (Hugging Face): https://huggingface.co/datasets/roneneldan/TinyStories
- Repositorio TinyStories-LLM de NonsonoNicola (referencia comparativa): https://github.com/NonsonoNicola/TinyStories-LLM
- Repositorio Mini-LLM de aman99dex (referencia comparativa): https://github.com/aman99dex/Mini-LLM
- Dataset TinyStories en ModelScope: https://www.modelscope.cn/datasets/AI-ModelScope/TinyStories
