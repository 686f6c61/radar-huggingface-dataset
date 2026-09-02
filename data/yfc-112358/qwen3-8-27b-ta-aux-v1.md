# YFC-112358/Qwen3.8-27B-TA-Aux-v1

## Resumen

Qwen3.8-27B-TA-Aux-v1 es un modelo de lenguaje creado por el usuario YFC-112358 mediante una técnica de fusión de modelos denominada *task arithmetic* (aritmética de tareas). Se construye a partir del modelo base Qwen/Qwen3.8-27B de Alibaba, al que se le suma la media ponderada de las diferencias (deltas) de seis micro-ajustes (fine-tunes) considerados "débiles", con un coeficiente global de 3.0049. El resultado es un checkpoint de 27.781 millones de parámetros, en formato safetensors, con licencia Qwen y soporte para chino e inglés.

El propósito declarado por el autor no es el uso independiente, sino servir como "ingrediente auxiliar" para condimentar o mejorar un modelo más fuerte en un proceso posterior de fusión. La model card advierte explícitamente que, usado de forma aislada, es probable que rinda peor que cualquiera de sus padres. No se han publicado evaluaciones de capacidad, por lo que su rendimiento real no está verificado. Su relevancia radica en ser un ejemplo de fusión de modelos con coeficientes explícitos y sin normalización convexa, una técnica que permite explorar el espacio de parámetros más allá de la combinación convexa tradicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta 262 144 tokens, pero no se confirma que el merge lo conserve) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Qwen (license: other, license_name: qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una operación de *task arithmetic* sobre el checkpoint base Qwen/Qwen3.8-27B. La fórmula empleada es:

M_AUX = Qwen/Qwen3.8-27B + 3.0049 · mean_i(θ_i − Qwen/Qwen3.8-27B)

donde i recorre seis modelos padre, todos ellos micro-ajustes del mismo base. Los padres incluyen tanto checkpoints completos como LoRAs aplicadas (con modo `compose`, es decir, el adaptador ya integrado en el checkpoint). El kernel de fusión es `sum` (suma directa de deltas), sin softmax ni renormalización convexa. El coeficiente 3.0049 es explícito y no se ajusta por ningún mecanismo de normalización. En la fase C del proceso, el coeficiente del padre "fuerte" se fija a 1.00, independientemente del número de padres.

No se dispone de información sobre el entrenamiento original del modelo base ni sobre los datos utilizados en los micro-ajustes. El autor indica que la fusión se realizó en Google Colab con lectura de pesos por HTTP Range, sin descargar el modelo completo. No se menciona ningún paso de RLHF, DPO o alineación adicional posterior a la fusión.

## Capacidades

- Al ser un merge del modelo Qwen3.8-27B, hereda teóricamente las capacidades del base: generación de texto, razonamiento, código, matemáticas, visión y soporte para agentes y *tool calling*.
- Soporte multilingüe limitado a chino e inglés, según la declaración de idiomas.
- No se ha verificado ninguna capacidad específica del merge mediante evaluaciones independientes.
- La model card advierte que, usado de forma aislada, es probable que el modelo rinda peor que sus padres, por lo que sus capacidades reales no están garantizadas.
- No se ha confirmado si el modelo mantiene el modo *thinking* o el soporte multimodal del base, ya que la fusión no incluye la torre de visión (visual tower no participó en el merge).

## Casos de uso

- **Componente en fusión de modelos (uso principal)**: el modelo está diseñado para ser combinado con un checkpoint más fuerte mediante *task arithmetic* u otras técnicas de merge, actuando como "condimento" que aporta características específicas de los micro-ajustes débiles. Se usaría como entrada en un proceso de fusión posterior, no como modelo final.
- **Investigación en técnicas de fusión**: sirve como caso de estudio para analizar el efecto de coeficientes explícitos y no convexos en la combinación de deltas, especialmente para entender cómo la magnitud del desplazamiento (‖Δ_M‖/‖W‖ ≈ 0.29) afecta al rendimiento.
- **Experimentos de ablación**: al ser un merge de solo padres débiles, permite comparar el rendimiento de un modelo auxiliar frente a sus padres y frente a un merge que incluya un modelo fuerte, para medir la contribución de cada componente.
- **Pruebas de robustez de la técnica**: dado que el coeficiente 3.0049 empuja el resultado fuera de la envolvente convexa de los padres, puede usarse para estudiar los límites de la extrapolación en el espacio de parámetros.
- **Desarrollo de pipelines de merge reproducibles**: la model card incluye los commit SHA de cada padre y la configuración exacta, lo que permite reproducir el merge y utilizarlo como referencia en herramientas como mergekit.
- **No recomendado para uso directo en producción**: al no tener evaluación publicada y ser explícitamente un modelo auxiliar, no es adecuado para tareas de usuario final sin una validación previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía, y el autor indica que "un modelo fusionado no vale nada antes de ser evaluado". No se proporcionan puntuaciones en MMLU, HumanEval, GSM8K ni ninguna otra prueba estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio ocupa 55,6 GB en FP16 (safetensors). Para cargar el modelo completo en precisión FP16 se necesitan al menos 56 GB de VRAM. Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ) se podría reducir a unos 16-18 GB, pero no se ofrecen versiones cuantizadas oficiales.
- **GPU recomendadas**: para FP16, una NVIDIA A100 (80 GB) o H100 (80 GB) sería adecuada. Para cuantización 4 bits, una RTX 4090 (24 GB) o similar podría ser suficiente, aunque no hay garantías de compatibilidad sin pruebas.
- **Opciones de despliegue**: al no existir versiones GGUF ni integraciones específicas, el despliegue requeriría convertir los pesos a un formato compatible con vLLM, llama.cpp u Ollama. No se ha verificado su funcionamiento en estos entornos.
- **Latencia y throughput**: no disponible. No se han realizado mediciones de rendimiento en tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | 262 144 | Qwen | Modelo original de Alibaba, multimodal, con evaluaciones publicadas |
| YFC-112358/Qwen3.8-27B-TA-Aux-v1 | 27,8 B | No disponible | Qwen | Merge de 6 padres débiles, sin evaluación, uso auxiliar |
| Otros merges de Qwen3.8-27B (p. ej. Della-Deckard-Fable-Qwopus-ColdFusion-v4) | 27,8 B | No disponible | Qwen | Uno de los padres de este merge, también sin evaluación pública |

No se dispone de datos de rendimiento comparativo, por lo que la comparación se limita a características estructurales. El modelo base Qwen3.8-27B tiene benchmarks oficiales que lo sitúan cerca de Claude Opus en tareas de código, pero este merge no ha sido evaluado.

## Limitaciones y advertencias

- **Modelo auxiliar, no para uso directo**: la model card es explícita: "es un modelo de relleno, no para usar solo". Su rendimiento aislado probablemente sea inferior al de cualquiera de sus padres.
- **Sin evaluación**: no hay ningún benchmark publicado. El autor advierte que "un modelo fusionado no vale nada antes de ser evaluado".
- **Riesgo de alucinación y sesgos**: al ser un merge sin alineación adicional, puede heredar sesgos de los micro-ajustes y del base, pero no hay datos para cuantificarlo.
- **Contexto no confirmado**: aunque el base soporta 262 144 tokens, no se ha verificado que el merge mantenga esa longitud de contexto. Es posible que la fusión altere la ventana efectiva.
- **Restricciones de licencia**: la licencia Qwen (license: other, license_name: qwen) puede imponer condiciones de uso comercial. Es necesario revisar los términos exactos de la licencia Qwen antes de cualquier despliegue en producción.
- **Reproducibilidad parcial**: aunque se documentan los commit SHA y la configuración, la fusión se realizó en un entorno específico (Colab) y no se garantiza que los resultados sean idénticos en otros entornos.
- **Sin soporte de visión**: la torre de visión no participó en el merge, por lo que las capacidades multimodales del base podrían estar degradadas o ausentes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YFC-112358/Qwen3.8-27B-TA-Aux-v1)
- [Modelo base Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Uno de los padres: Qwen3.8-27B-Della-Deckard-Fable-Qwopus-ColdFusion-v4](https://huggingface.co/YFC-112358/Qwen3.8-27B-Della-Deckard-Fable-Qwopus-ColdFusion-v4/tree/main)
- [Artículo sobre Qwen3.8-27B (contexto del base)](https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026)
