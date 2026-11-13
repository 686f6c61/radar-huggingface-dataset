# TheTinyIntelLab/opal-norman

## Resumen
Opal Norman es un checkpoint de referencia de expresión génica desarrollado por The Tiny Intelligence Lab para el ensayo de perturbación CRISPRa Norman en la línea celular K562. No es un modelo de lenguaje ni un transformer generativo: es un modelo residual de kernel que combina efectos medidos de perturbaciones individuales con una corrección simétrica de pares ajustada, y devuelve un vector de efecto de expresión en la media poblacional, en el orden génico almacenado. Su propósito es servir como referencia reproducible para tareas de predicción de respuesta a perturbaciones (perturbation-response) en investigación biológica computacional.

El modelo está acotado a un contexto experimental concreto: `K562/CRISPRa/Norman2019`. Solo acepta símbolos génicos exactos soportados en ese contexto, rechaza intervenciones desconocidas, pares con el mismo target y órdenes génicos que no coincidan con el almacenado. Los efectos se expresan en la escala log2 del checkpoint. Esta especialización lo hace útil como referencia histórica y base de comparación, no como predictor general de intervenciones arbitrarias.

Es relevante ahora porque el ecosistema de modelos biológicos de perturbación crece rápido y escasean las referencias con procedencia verificable: este repositorio conserva hashes SHA-256 de los ficheros originales, un manifiesto con el contexto soportado y las identidades de los pares de entrenamiento y benchmark, y documenta explícitamente resultados negativos y criterios de promoción fallidos. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo residual de kernel con corrección simétrica de pares (no transformer; loaders personalizados de Opal, no `transformers.AutoModel`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (contexto experimental fijo: `K562/CRISPRa/Norman2019`) |
| Tipos de cuantizacion | no disponible (checkpoint de referencia, no orientado a cuantización) |
| Idiomas soportados | no aplica (modelo biológico; entrada basada en símbolos génicos) |
| Licencia | CC BY 4.0 (modelo y contenido de referencia); el software Opal y el ejemplo de inferencia usan MIT en `CODE_LICENSE.txt` |
| Formato de pesos | no disponible (ficheros propios cargados con loaders de Opal; se distribuyen `provenance.json`, `SHA256SUMS.txt` y `verification.json`) |

## Arquitectura y entrenamiento
La arquitectura es un modelo residual de kernel específico para el ensayo Norman. Agrega células retenidas en medias poblacionales emparejadas y ajusta un modelo residual sobre ellas, incorporando una corrección simétrica de pares ajustada. La salida es un vector de efecto de expresión en la media poblacional, en el orden génico almacenado, en escala log2. No se trata de una red neuronal profunda ni de un transformer; la carga se realiza con los loaders personalizados de Opal, no con la API estándar de `transformers`.

Los datos proceden de scPerturb v1.1 (registro Zenodo 7278143, fichero `NormanWeissman2019_filtered.h5ad`), derivado del estudio de Norman et al. (Science, 2019) sobre manifold de interacciones genéticas en fenotipos de célula única. El empaquetado de este repositorio no ejecuta entrenamiento nuevo: verifica hashes de los ficheros originales, la inferencia correcta, la finitud de las salidas, el orden génico de salida y la simetría respecto al orden de los pares. No se realizó nuevo ajuste, selección de hiperparámetros ni puntuación biológica durante el empaquetado. El manifiesto original tiene SHA-256 `b7ecce11de745bf3d89807a2dbcf97073512d2d05fb44090ec92310b95d75456`.

## Capacidades
- Predicción de efectos de expresión en media poblacional para perturbaciones simples y pares de perturbaciones en el contexto `K562/CRISPRa/Norman2019`.
- Combinación de efectos medidos de perturbaciones individuales con una corrección simétrica de pares ajustada.
- Validación de entradas: rechaza intervenciones desconocidas, pares con el mismo target y órdenes génicos que no coincidan con el almacenado.
- Salida determinista en el orden génico almacenado, en escala log2 del checkpoint.
- Verificación de integridad mediante hashes SHA-256 de los ficheros originales y del manifiesto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso
- Referencia de comparación en benchmarks de perturbación: usar el checkpoint como baseline histórico para evaluar modelos nuevos de predicción de respuesta a perturbaciones en el ensayo Norman, aprovechando que las identidades de los pares de entrenamiento y benchmark quedan registradas en el manifiesto.
- Reproducibilidad de estudios: cargar el checkpoint con los loaders de Opal y verificar los hashes originales para reproducir exactamente los efectos de expresión reportados en un análisis previo sobre K562/CRISPRa.
- Auditoría de procedencia: emplear `provenance.json`, `SHA256SUMS.txt` y `verification.json` para trazar el origen de cada fichero hasta scPerturb v1.1 y el estudio de Norman et al., útil en revisiones de publicaciones.
- Docencia e investigación metodológica: ilustrar cómo se construye una referencia de efectos poblacionales a partir de datos de célula única agregados, y por qué las comparaciones de composición de expresión pueden dar resultados negativos frente a referencias simples.
- Diseño de experimentos de validación: identificar pares de perturbaciones soportados y sus efectos esperados para priorizar validaciones experimentales en K562 con CRISPRa, siempre dentro del contexto acotado.
- Pruebas de integración de pipelines biológicos: validar que un pipeline de inferencia carga correctamente un modelo con loaders personalizados (no `transformers.AutoModel`) y respeta el orden génico y la simetría de pares antes de conectar modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card declara `model-index: []` y señala que el benchmark de crecimiento de seis tareas pertenece a otro endpoint y no debe atribuirse a este checkpoint de expresión. Las comprobaciones de empaquetado (hashes, inferencia, salidas finitas, orden génico y simetría de pares) son verificaciones de humo de inferencia, no una evaluación biológica nueva.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y el ejemplo de referencia se ejecuta en CPU.
- GPU recomendadas: no se especifican; el quick start instala `torch==2.9.1` con índice CPU (`https://download.pytorch.org/whl/cpu`), lo que indica que la inferencia de referencia está pensada para CPU.
- Cabe en GPU de consumo: no hay requisitos de GPU declarados; por el tamaño del repositorio, la carga en CPU es viable.
- Opciones de despliegue: carga mediante los loaders personalizados de Opal (repositorio `TheTinyIntelLab/opal`, release v1.0.0); no compatible con `transformers.AutoModel`, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno verificado: Python 3.11-3.14 (verificación local con Python 3.14.0), con dependencias fijadas en `requirements.txt` a la revisión exacta del código Opal.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de predicción de respuesta a perturbaciones en el mismo contexto (K562/CRISPRa/Norman2019) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias
- Los efectos son medias poblacionales: no reproducen distribuciones a nivel de célula ni identifican mecanismos moleculares causales.
- Requiere referencias simples medidas y locales a la fuente; no es un predictor general de intervenciones en frío ni de contextos arbitrarios.
- Solo soporta el contexto `K562/CRISPRa/Norman2019` y símbolos génicos exactos; cualquier otro contexto o intervención se rechaza.
- Los diagnósticos de fiabilidad e incertidumbre son exploratorios, sin garantía calibrada de cobertura biológica.
- No hay validación para uso clínico, ni reclamación de descubrimiento biológico, ni superioridad frente al estado del arte establecida.
- El benchmark de crecimiento de seis tareas pertenece a otro endpoint y no debe atribuirse a este checkpoint.
- Las comparaciones retenidas de composición de expresión incluyen resultados negativos frente a referencias simples seleccionadas; el release más amplio también conserva fallos de transferencia externa congelada y criterios de promoción fallidos.
- Licencia CC BY 4.0 para el modelo y el contenido de referencia: exige atribución a los creadores de scPerturb y a Norman et al. (2019). La licencia MIT del software Opal no sustituye la licencia del modelo.
- No se incluye el dataset de célula única en bruto; los bytes originales del checkpoint y del manifiesto se preservan sin nuevo entrenamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/TheTinyIntelLab/opal-norman
- Código fuente Opal (v1.0.0): https://github.com/TheTinyIntelLab/opal/tree/v1.0.0
- Preprint de investigación: https://github.com/TheTinyIntelLab/opal/blob/v1.0.0/paper/main.pdf
- Hallazgos científicos y resultados negativos: https://github.com/TheTinyIntelLab/opal/blob/v1.0.0/docs/research.md
- The Tiny Intelligence Lab: https://thetinyintelligencelab.vercel.app/
- Dataset de origen scPerturb v1.1 (Zenodo 7278143): https://zenodo.org/records/7278143
- Estudio original Norman et al., Science (2019): https://doi.org/10.1126/science.aax4438
