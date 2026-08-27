# tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-SpectralSurgery-HNS8p2-AllMods

## Resumen

Este repositorio contiene un adaptador LoRA derivado del modelo `meta-llama/Llama-3.1-8B-Instruct`, entrenado sobre el subconjunto de 50 000 muestras del dataset MetaMathQA y posteriormente refinado con la técnica de *Spectral Surgery* (concretamente, con el algoritmo HNS, *Hessian-based Nullspace Surgery*). El resultado es un adaptador de bajo rango (rank 16) que, aplicado sobre el modelo base, mejora el rendimiento en el benchmark GSM8K de razonamiento matemático, pasando del 77,18 % del LoRA vanilla al 79,38 % con la configuración propuesta.

El interés de este modelo radica en que demuestra cómo una intervención post-entrenamiento sobre los pesos de un adaptador LoRA puede producir ganancias adicionales sin necesidad de más datos ni de un ajuste fino adicional. Aunque el adaptador está especializado en matemáticas, al estar montado sobre Llama-3.1-8B-Instruct conserva las capacidades generales del modelo base (generación de texto, razonamiento, código, multilingüe, etc.). El repositorio es pequeño (0,2 GB) y está publicado en formato PEFT con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B-Instruct) con adaptadores LoRA |
| Parametros totales | No disponible (el adaptador es de bajo rango, rank 16; el modelo base tiene 8 000 millones) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, que soporta 128 000 tokens segun documentacion de Llama 3.1) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precision original; el base puede cuantizarse) |
| Idiomas soportados | No disponibles (heredados del modelo base, que es multilingue) |
| Licencia | No disponible (el modelo base tiene licencia Llama 3.1, pero el adaptador no especifica) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`, un transformer autoregresivo con atención por grupos (GQA) y 8 000 millones de parámetros. El entrenamiento inicial consistió en un ajuste fino con LoRA (rank 16) sobre 50 000 muestras del dataset MetaMathQA, un conjunto de problemas matemáticos con soluciones razonadas. Posteriormente se aplicó la técnica *Spectral Surgery* sobre todos los módulos LoRA (target: all LoRA modules), utilizando el algoritmo HNS con 8 pasos rápidos y 2 pasos estables. Esta intervención modifica los pesos del adaptador en el espacio nulo de la Hessiana para mejorar la generalización sin degradar el rendimiento en los datos de entrenamiento. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Razonamiento matemático: el adaptador está específicamente entrenado para resolver problemas aritméticos y algebraicos, con mejoras demostradas en GSM8K.
- Generación de texto y diálogo: al estar basado en Llama-3.1-8B-Instruct, conserva las capacidades conversacionales y de generación del modelo base.
- Razonamiento multi-paso: el entrenamiento con MetaMathQA fomenta la generación de cadenas de razonamiento paso a paso.
- Multilingüismo: hereda el soporte multilingüe del modelo base (aunque no se especifican los idiomas en el adaptador).
- Tool calling y funciones: no se menciona explícitamente, pero el modelo base las soporta; el adaptador no las elimina.
- Capacidades de agente: no se documentan específicamente, pero el base puede usarse en pipelines de agentes.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede generar soluciones detalladas paso a paso para problemas de nivel escolar y universitario, útil en plataformas de tutoría automática.
- Evaluación de modelos en benchmarks de razonamiento: al mejorar el rendimiento en GSM8K, puede usarse como referencia para comparar otras técnicas de ajuste fino o post-entrenamiento.
- Generación de ejercicios matemáticos: puede crear problemas y soluciones para materiales didácticos, aprovechando su entrenamiento en MetaMathQA.
- Asistente de cálculo en aplicaciones de productividad: integrado en herramientas de chat, puede ayudar a resolver operaciones numéricas y explicar conceptos matemáticos.
- Investigación en técnicas de post-entrenamiento: el adaptador sirve como caso de estudio para la técnica Spectral Surgery, permitiendo reproducir y analizar sus efectos.
- Fine-tuning adicional sobre dominios específicos: al ser un adaptador LoRA, puede combinarse con otros adaptadores o continuar su entrenamiento para tareas matemáticas más especializadas.

## Benchmarks y rendimiento

El autor reporta resultados en el benchmark GSM8K (conjunto de test, 1319 problemas). La tabla siguiente muestra la precisión del modelo base, del LoRA vanilla y de varias configuraciones de Spectral Surgery.

| Modelo | GSM8K |
|---|---:|
| Base (Llama-3.1-8B-Instruct) | 65,20 % (860/1319) |
| LoRA (MetaMathQA-50K) | 77,18 % (1018/1319) |
| HNS 8+2, o_proj + down_proj | 78,39 % (1034/1319) |
| **HNS 8+2, all modules** | **79,38 % (1047/1319)** |
| HNS 4+1, o_proj + down_proj | 78,17 % (1031/1319) |
| HNS 4+1, all modules | 79,38 % (1047/1319) |

La configuración recomendada (HNS 8+2, todos los módulos) mejora la precisión del LoRA vanilla en 2,20 puntos porcentuales, lo que equivale a 29 respuestas correctas adicionales. No se han publicado resultados en otros benchmarks.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero para inferencia es necesario cargar el modelo base completo (8 000 millones de parámetros).
- VRAM estimada: en FP16, el modelo base requiere aproximadamente 16 GB; con cuantización de 4 bits (por ejemplo, bitsandbytes) puede reducirse a unos 6-8 GB.
- GPU recomendadas: para FP16, una GPU con al menos 16 GB (RTX 4090, A100 40 GB, etc.). Para cuantización 4 bits, una RTX 3060/4070 con 8-12 GB puede ser suficiente.
- El adaptador es compatible con el ecosistema PEFT de Hugging Face, por lo que puede cargarse con `transformers` + `peft` y desplegarse en frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no se han publicado mediciones específicas; dependerán del hardware y del método de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | 65,20 % | Llama 3.1 |
| Llama-3.1-8B-Instruct + LoRA MetaMathQA | 8B + adaptador | 128K | 77,18 % | No especificada |
| **Este adaptador (HNS 8+2, all modules)** | 8B + adaptador | 128K | **79,38 %** | No especificada |

No se dispone de comparación con otros modelos matemáticos como MetaMath-7B o WizardMath, ya que no se han reportado datos en la información disponible.

## Limitaciones y advertencias

- La licencia del adaptador no está especificada; el modelo base tiene licencia Llama 3.1, que impone restricciones de uso comercial para ciertos casos. Es necesario verificar la compatibilidad antes de usar el adaptador en producción.
- El adaptador está especializado en matemáticas; su rendimiento en otras tareas puede ser similar al del base, pero no se ha evaluado específicamente.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos o ambiguos.
- Sesgos: el modelo base puede contener sesgos derivados de sus datos de entrenamiento; el adaptador no los corrige.
- La técnica Spectral Surgery no está documentada en detalle en el repositorio; su reproducibilidad depende de la implementación del autor.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigación sin validación externa amplia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-SpectralSurgery-HNS8p2-AllMods
- Modelo base (Llama-3.1-8B-Instruct): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentación del modelo base (README): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/README.md
- Información adicional sobre Llama-3.1-8B-Instruct: https://www.aimodels.fyi/models/huggingFace/llama-3.1-8b-instruct-meta-llama
