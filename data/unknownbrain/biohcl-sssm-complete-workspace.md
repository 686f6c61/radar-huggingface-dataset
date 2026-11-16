# unknownBrain/BioHCL-SSSM-Complete-Workspace

## Resumen

BioHCL-SSSM es un modelo de clasificación de imágenes médicas desarrollado por el autor independiente unknownBrain, orientado a la detección de neumonía pediátrica en radiografías de tórax. Combina una arquitectura híbrida de convolución jerárquica con modelos de espacio de estados (SSM, tipo Mamba) y componentes informados por física (physics-informed neural networks), según los tags declarados en el repositorio. El modelo se publica como un workspace completo que incluye los pesos de las 10 particiones de validación cruzada, el código de entrenamiento, los barridos de ablación y las figuras de evaluación.

El problema que aborda es el diagnóstico automatizado de neumonía en población pediátrica a partir del cohorte público del Guangzhou Women and Children's Medical Center (Kermany et al., *Cell* 2018), con 5.856 imágenes y una partición de test oficial de 624 imágenes. El autor declara un rendimiento medio en validación cruzada de 10 particiones del 99,37 % de exactitud y 0,9957 de F1, y un 96,47 % de exactitud en el conjunto de test retenido.

El modelo es relevante por su propuesta arquitectónica (SSM aplicado a imagen médica en lugar de transformers puros) y por su reducido coste computacional declarado: 14,01 M de parámetros y 8,56 GFLOPs, lo que lo sitúa en la liga de modelos ligeros aptos para despliegue en entornos con recursos limitados. No obstante, se trata de un repositorio con cero descargas y cero likes en el momento de la consulta, y los resultados no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: convolución jerárquica + state-space model (SSSM, tipo Mamba) + componentes physics-informed |
| Parametros totales | 14,01 M (declarado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de imagen, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) según metadatos; la tarea es clasificación de imagen, no generación de texto |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.pt`), 54 MB por fold según la model card |
| Pipeline | `image-classification` |
| Resolución de entrada | No disponible |
| FLOPs | 8,56 GFLOPs (declarado) |
| Tamaño del repositorio | 0,6 GB |
| Dataset de entrenamiento | `paultimothymooney/chest-xray-pneumonia` (Kermany et al., Cell 2018) |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como un híbrido de convolución jerárquica y modelos de espacio de estados (SSM), con la etiqueta `sssm` y referencias a Mamba. El autor incluye una tabla de ablación de componentes (SSSM frente a atención y CNN) y una tabla de deducción de hiperparámetros de la capa SSSM, lo que sugiere que la contribución principal es sustituir la autoatención por un mecanismo de espacio de estados en el bloque de modelado global. También se mencionan componentes physics-informed (PINN) y una función de pérdida con ponderación de clases (`lambda_bio`), cuyos pesos se exploran en barridos de ablación.

El entrenamiento se realizó sobre el cohorte pediátrico de Guangzhou (5.856 imágenes) con validación cruzada de 10 particiones. El autor reporta 64 ejecuciones de barrido de ablación y logs de perfilado de hardware. El checkpoint `best_student_cv.pt` corresponde al fold 2, con 99,81 % de exactitud de validación, 0,9987 de F1, 100 % de recall y 99,26 % de especificidad. No se detalla en la información disponible el número de tokens o épocas, la composición exacta del dataset más allá de la referencia al cohorte, ni si hubo fases de ajuste fino adicionales. El repositorio incluye 12 artículos de referencia revisados por pares, pero no se especifica cuáles se usaron como base metodológica directa.

## Capacidades

- Clasificación binaria de radiografías de tórax para detección de neumonía pediátrica.
- Generación de mapas de explicabilidad: la model card menciona Attention, GradCAM, LIME y SHAP (`build_xai.py`).
- Evaluación con validación cruzada de 10 particiones y checkpoints independientes por fold.
- Soporte de herramientas de evaluación y benchmarking incluidas en el repositorio (`build_benchmark.py`, `build_ablations.py`, `build_eval.py`).
- No se declaran capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidad multilingüe: no aplica; el modelo procesa imágenes, no texto.

## Casos de uso

- Triaje asistido en radiología pediátrica: el modelo puede preclasificar radiografías de tórax y priorizar casos sospechosos de neumonía para revisión del radiólogo, aprovechando su bajo coste (8,56 GFLOPs) para integrarse en visores de imagen.
- Investigación en arquitecturas SSM para imagen médica: el repositorio incluye ablaciones y código modular que permiten reproducir y extender el estudio comparando SSSM frente a atención y CNN.
- Despliegue en entornos con recursos limitados: con 14,01 M de parámetros, es viable en GPU de consumo y en hardware de borde, lo que facilita su uso en centros sanitarios sin infraestructura de alto rendimiento.
- Docencia y formación en diagnóstico por imagen: los mapas de explicabilidad (GradCAM, LIME, SHAP) permiten ilustrar qué regiones de la radiografía activan la decisión del modelo.
- Evaluación comparativa de modelos ligeros: sirve como baseline en estudios que comparen arquitecturas SSM con ViT o CNN en clasificación de imagen médica, dado que el autor incluye un benchmark de 15 modelos.
- Auditoría de pipelines de clasificación médica: el código de evaluación y las particiones de validación cruzada permiten auditar la robustez del modelo frente a variaciones de partición.
- Prototipado de sistemas de apoyo a la decisión: la licencia MIT y la modularidad del código facilitan integrar el clasificador en prototipos de software clínico, siempre con validación local adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados de forma independiente):

| Metrica | Valor | Conjunto |
|---|---|---|
| Exactitud (validación cruzada 10 folds) | 99,37 % ± 0,33 % | Cohort pediátrico de Guangzhou |
| F1 (validación cruzada 10 folds) | 0,9957 ± 0,0022 | Cohort pediátrico de Guangzhou |
| ROC-AUC (validación cruzada 10 folds) | 0,9929 ± 0,0039 | Cohort pediátrico de Guangzhou |
| Exactitud (fold 2) | 99,81 % | Validación fold 2 |
| F1 (fold 2) | 0,9987 | Validación fold 2 |
| Recall (fold 2) | 100 % | Validación fold 2 |
| Especificidad (fold 2) | 99,26 % | Validación fold 2 |
| Exactitud (test retenido, 624 imágenes) | 96,47 % | Test oficial |
| F1 (test retenido) | 97,22 % | Test oficial |
| ROC-AUC (test retenido) | 99,37 % | Test oficial |

Errores agrupados en validación cruzada: 33 errores sobre 5.232 imágenes (3.862 verdaderos positivos, 1.337 verdaderos negativos, 12 falsos positivos, 21 falsos negativos). El autor declara además una comparación con ViT-Base (86,57 M de parámetros) en el conjunto de test, pero la información disponible se interrumpe y no se proporcionan los valores completos de esa comparación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 14,01 M de parámetros y checkpoints de 54 MB, la inferencia en FP32 requiere del orden de decenas de MB de pesos, holgadamente por debajo de 1 GB incluyendo activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo cabe en GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, según el tamaño declarado.
- Opciones de despliegue: el repositorio proporciona código PyTorch (`extracted_code.py`, paquete `src/`), por lo que el despliegue se haría con PyTorch nativo o TorchScript; no se mencionan exportaciones a ONNX, GGUF, vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. El autor menciona un runner de ablaciones que tarda unos 10 minutos en GPU, pero no se aportan cifras de latencia por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioHCL-SSSM | 14,01 M | Imagen de radiografía de tórax | 96,47 % exactitud en test retenido (declarado) | MIT | Hugging Face, 0 descargas |
| ViT-Base (referencia del autor) | 86,57 M | Imagen | No disponible en la información (la comparación está truncada) | Según checkpoint original | Amplia |
| CNN clásicas para neumonía (p. ej. ResNet) | No disponible | Imagen | No disponible en la información | Según checkpoint original | Amplia |

La comparación con alternativas queda limitada porque la información proporcionada corta la descripción del benchmark de 15 modelos y no ofrece los valores completos de ViT-Base ni de las CNN de referencia. No se dispone de datos suficientes para una comparativa cuantitativa fiable más allá del número de parámetros.

## Limitaciones y advertencias

- Resultados no verificados: el `model-index` marca las métricas como `verified: false`; no hay validación independiente.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que dificulta evaluar su robustez en uso real.
- Dominio muy restringido: entrenado exclusivamente en un cohorte pediátrico de un único centro (Guangzhou); la generalización a otras poblaciones, equipos de rayos X o protocolos de adquisición no está demostrada.
- Riesgo de sobreajuste al dataset: las métricas de validación cruzada (99,37 %) son muy superiores a las del test retenido (96,47 %), lo que sugiere una brecha de generalización que conviene auditar.
- Sesgos demográficos: al proceder de un cohorte pediátrico de un solo hospital, puede presentar sesgos de edad, etnia y prevalencia de la enfermedad.
- Uso clínico: no es un dispositivo médico certificado; no debe usarse para diagnóstico autónomo sin validación regulatoria y supervisión profesional.
- Idiomas: los metadatos solo declaran inglés, aunque al ser un clasificador de imagen el idioma es irrelevante para la tarea.
- Licencia MIT: permite uso comercial y modificación, pero la licencia no cubre las responsabilidades clínicas derivadas del uso.
- Documentación incompleta: no se detallan la resolución de entrada, el preprocesado exacto, la composición del dataset más allá de la referencia, ni los hiperparámetros de entrenamiento completos.

## Enlaces

- Hugging Face: https://huggingface.co/unknownBrain/BioHCL-SSSM-Complete-Workspace
- Dataset de referencia: https://huggingface.co/datasets/paultimothymooney/chest-xray-pneumonia
- Paper del cohorte original: Kermany et al., *Cell* 2018 (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Repositorio de código: incluido dentro del propio repositorio de Hugging Face (carpetas `medical imaging/` y `hf_repo_staging/src/`)
- Demos: no disponibles
- Blog o paper del modelo: no disponibles
