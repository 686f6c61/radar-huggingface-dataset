# zxcghoul3228/DOSSIER

## Resumen

DOSSIER (Density of States from Stoichiometry with Encoder Representations) es un modelo de aprendizaje automático orientado a ciencia de materiales que predice la densidad de estados electrónicos (DOS) de un compuesto a partir únicamente de su fórmula estequiométrica, sin necesidad de conocer su estructura cristalina. Desarrollado por el usuario zxcghoul3228, el modelo combina un encoder ModernBERT —preentrenado mediante destilación desde un potencial interatómico universal basado en machine learning— con un decodificador deconvolucional que produce una salida sobre una rejilla de 401 puntos de energía entre -10 y +10 eV respecto al nivel de Fermi. La salida se expresa en unidades de estados por eV y por átomo (states eV⁻¹ atom⁻¹).

La relevancia de este modelo radica en que permite estimar propiedades electrónicas de materiales de forma rápida y sin recurrir a costosos cálculos de primeros principios, lo que facilita el cribado de nuevos compuestos y la exploración de espacios composicionales. Aunque el repositorio no incluye métricas de validación externa, la arquitectura basada en ModernBERT y la tarea específica lo convierten en una herramienta potencialmente útil para la comunidad de materiales computacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) + cabeza deconvolucional (transposed convolution) |
| Parametros totales | no disponible (tamano del repo: 1.6 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el modelo procesa formulas quimicas, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo combina un encoder ModernBERT que procesa la representacion tokenizada de la formula estequiometrica, seguido de un decodificador deconvolucional que proyecta la representacion latente a una rejilla de energia fija de 401 puntos (-10 a +10 eV vs. nivel de Fermi). El encoder fue preentrenado mediante destilacion desde un potencial interatomatico universal basado en ML, lo que le confiere una comprension de las relaciones composicion-estructura. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de ajuste fino; la model card solo indica que el objetivo es mapear la estequiometria a la DOS.

## Capacidades

- Prediccion de la densidad de estados electronicos (DOS) a partir de la formula estequiometrica.
- Salida en unidades de states eV⁻¹ atom⁻¹ sobre una rejilla fija de 401 puntos de energia.
- No requiere estructura cristalina, solo la composicion quimica.
- Potencialmente util para cribado de materiales y estimacion de propiedades electronicas.
- Al ser un modelo tipo encoder, puede integrarse en pipelines de clasificacion o regresion.
- Compatible con la libreria transformers y con Hugging Face Inference Endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Cribado de nuevos materiales: evaluar rapidamente la DOS de compuestos hipoteticos sin realizar calculos DFT costosos, permitiendo priorizar candidatos para sintesis o simulaciones detalladas.
- Estimacion de propiedades electronicas: obtener el ancho de banda prohibida o la densidad de estados en el nivel de Fermi a partir de la DOS predicha, util para clasificar materiales como conductores, semiconductores o aislantes.
- Integracion en bases de datos de materiales: completar propiedades electronicas faltantes en catalogos como Materials Project o OQMD, usando solo la composicion.
- Generacion de descriptores para modelos aguas abajo: usar la DOS predicha como entrada para otros modelos de machine learning que predicen propiedades macroscopicas (conductividad, etc.).
- Exploracion de espacios composicionales: buscar compuestos con caracteristicas electronicas especificas (por ejemplo, alta DOS en el nivel de Fermi) variando la estequiometria.
- Validacion rapida de resultados experimentales: comparar DOS predichas con espectros de fotoemision o absorcion para detectar discrepancias y guiar interpretaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 1.6 GB, lo que sugiere que el modelo en FP32 puede requerir aproximadamente 4-6 GB de VRAM para inferencia (estimacion basada en el tamano del archivo; no se dispone de datos exactos de parametros).
- GPU recomendada: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 2070, RTX 3060, RTX 4060) para inferencia en FP32 sin problemas.
- Para despliegue en produccion, se puede usar Hugging Face Inference Endpoints o un servidor con vLLM o TGI, aunque el modelo no esta optimizado para esos frameworks especificamente.
- Tambien es posible ejecutar el modelo en CPU para inferencia por lotes, con latencias mayores.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma tarea (prediccion de DOS desde estequiometria). Existen modelos como MEGNet o CGCNN que predicen propiedades de materiales, pero no estan directamente disponibles para comparacion aqui. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo solo acepta formulas estequiometricas como entrada; no procesa estructuras cristalinas ni otra informacion geometrica, lo que limita su precision para compuestos con polimorfismo o efectos de empaquetamiento.
- La precision de las predicciones puede verse limitada para compuestos con comportamientos electronicos complejos (fuertes correlaciones, efectos relativistas, magnetismo), donde la DOS depende fuertemente de la estructura.
- No se han publicado metricas de validacion externa, por lo que se recomienda validar las predicciones con calculos DFT o experimentos antes de usar en decisiones criticas.
- El modelo puede tener sesgos hacia elementos o tipos de compuestos presentes en su dataset de entrenamiento, que no se ha hecho publico.
- La licencia MIT permite uso comercial, pero el usuario debe verificar la procedencia de los datos de entrenamiento si se requiere atribucion o si existen restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zxcghoul3228/DOSSIER
- Demo Space: https://huggingface.co/spaces/zxcghoul3228/DOSSIER_demo
