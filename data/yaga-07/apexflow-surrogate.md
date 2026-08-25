# yaga-07/apexflow-surrogate

## Resumen

ApexFlow Airfoil Aerodynamics Surrogate es un modelo sustituto (surrogate model) desarrollado por yaga-07 para predecir flujo RANS 2D estacionario e incompresible alrededor de perfiles aerodinámicos NACA de 4 dígitos. En lugar de ejecutar simulaciones CFD completas con OpenFOAM, este modelo ofrece una aproximación rápida y ligera, entrenada con datos generados mediante `simpleFoam` con el modelo de turbulencia kOmegaSST. Está pensado para ingenieros e investigadores que necesitan evaluar múltiples configuraciones de diseño sin el coste computacional de un solver CFD.

El modelo se compone de dos rutas complementarias: una U-Net (483.763 parámetros) que predice el campo de flujo completo (velocidades y coeficiente de presión) en una malla de 128x128, y un MLP basado en coordenadas (8.897 parámetros) que predice directamente el coeficiente de presión (Cp) en la superficie del perfil, lo que permite una recuperación más precisa de las fuerzas aerodinámicas. Ambos checkpoints son autocontenidos e incluyen la configuración de arquitectura y las estadísticas de normalización.

Su relevancia actual radica en la creciente demanda de modelos sustitutos en ingeniería asistida por ordenador, especialmente en etapas de exploración de diseño y optimización paramétrica, donde la velocidad de evaluación es crítica. Aunque su alcance es limitado (solo perfiles NACA 4, un único número de Reynolds y condiciones estacionarias), demuestra un enfoque práctico para integrar aprendizaje profundo en flujos de trabajo de CFD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (Route A) y MLP coordinado (Route B) |
| Parametros totales | 483.763 (Route A) / 8.897 (Route B) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de simulacion fisica, no generativo de texto) |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch nativos, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (modelo numerico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo se divide en dos rutas de inferencia. La Route A emplea una U-Net convolucional que recibe una entrada de 5 canales (función de distancia firmada, máscara fluido/sólido, coordenadas x y z, y ángulo de ataque) sobre una malla uniforme de 128x128, y produce como salida los campos normalizados (u/U∞, v/U∞, Cp) en la misma malla. La Route B es un MLP que opera sobre puntos de la superficie del perfil, tomando como entrada la posición fraccional de arco, las coordenadas x y z, los parámetros de combadura (m, p), el espesor (t) y el ángulo de ataque, y devuelve el Cp en ese punto exacto.

El entrenamiento se realizó con 99 casos CFD independientes generados con OpenFOAM (69 para entrenamiento, 15 para validación y 15 para prueba), muestreados mediante Latin Hypercube. El rango de parámetros cubre combadura m ∈ [0, 0.04], posición de combadura p ∈ [0.2, 0.6], espesor t ∈ [0.08, 0.18] y ángulo de ataque ∈ [-5°, 9°]. Se excluyeron explícitamente los casos que no convergían físicamente (oscilaciones en coeficientes de fuerza, típicamente por encima de AoA ≈ 9°). No se aplicaron técnicas de RLHF o DPO, al no tratarse de un modelo de lenguaje. Los checkpoints incluyen las estadísticas de normalización calculadas solo sobre el split de entrenamiento.

## Capacidades

- Predicción de campos de flujo completos (u, v, Cp) en una malla de 128x128 para perfiles NACA 4.
- Predicción directa del coeficiente de presión (Cp) en puntos de la superficie del perfil.
- Estimación de coeficientes aerodinámicos: error medio de |Cl| de 0.023 (Route B) y error medio de |Cd de presión| de 0.0043 (Route B).
- Soporte para un rango definido de parámetros geométricos (combadura, posición de combadura, espesor) y ángulos de ataque.
- Inferencia extremadamente ligera: el modelo completo cabe en menos de 1 MB, permitiendo ejecución en CPU en milisegundos.
- No es un modelo de lenguaje: no dispone de generación de texto, tool calling, ni capacidades multimodales.

## Casos de uso

- Exploración preliminar de diseño de perfiles NACA 4: permite evaluar rápidamente cientos de variaciones de combadura, espesor y ángulo de ataque sin ejecutar CFD, ideal para las primeras fases de un estudio paramétrico.
- Optimización de parámetros aerodinámicos: puede integrarse en bucles de optimización (genéticos, gradiente) para maximizar la sustentación o minimizar la resistencia de presión, reduciendo el coste computacional de cada evaluación.
- Screening de configuraciones antes de validación CFD: permite filtrar diseños prometedores y descartar los inviables antes de lanzar simulaciones de alta fidelidad con OpenFOAM.
- Educación y demostración de surrogate modeling: útil en cursos de aerodinámica computacional o aprendizaje automático aplicado, mostrando cómo un modelo entrenado con datos CFD puede aproximar soluciones de RANS.
- Estimación de cargas en diseño conceptual: proporciona valores aproximados de Cl y Cd de presión para alimentar modelos de rendimiento de aeronaves o vehículos en etapas tempranas.
- Integración en pipelines de diseño generativo: puede combinarse con generadores de geometrías paramétricas para explorar el espacio de diseño de forma automatizada, siempre que se respeten los límites de extrapolación.

## Benchmarks y rendimiento

Los resultados presentados corresponden al split de prueba retenido (15 casos) según la model card del autor:

| Metrica | Route A (U-Net, campo) | Route B (MLP de superficie) |
|---|---:|---:|
| Parametros | 483.763 | 8.897 |
| MSE de campo (u\*, v\*, Cp), unidades fisicas | 0.00031 / 0.00005 / 0.00013 | -- |
| Error medio \|Cl\| vs CFD | 0.076 | **0.023** |
| Error medio \|Cd (presion)\| vs CFD | 0.0034 | 0.0043 |
| Cd dentro de tolerancia 0.01 | -- | 15/15 |

El autor señala que el error de Cl en la Route A está limitado por un artefacto de interpolación de la malla (el error de integración de la Cp gridificada es de 0.24), no por la calidad del modelo. La Route B evita este problema al predecir Cp directamente en los puntos de superficie. Ambos modelos degradan su precisión cerca de AoA ≈ 8-9°, coincidiendo con el inicio de la separación del flujo.

## Requisitos de hardware

- Modelo extremadamente ligero: menos de 0.5 millones de parámetros en total (sumando ambas rutas).
- Inferencia en CPU sin necesidad de GPU. La VRAM estimada es inferior a 1 GB, siendo probablemente suficiente con unos pocos cientos de MB.
- Cualquier GPU moderna (incluso integradas) puede ejecutar el modelo sin problemas, aunque no es necesaria.
- Despliegue sencillo: requiere Python y PyTorch. No es compatible con vLLM, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia estimada en CPU: del orden de milisegundos por evaluación, lo que permite su uso en bucles de optimización interactivos.

## Comparativa con modelos similares

No se han identificado modelos comparables directos en la información proporcionada. Este modelo ocupa una categoría específica (surrogate de CFD para perfiles NACA 4), y no se dispone de datos de otros surrogates con los que comparar parámetros, contexto o rendimiento. Como referencia cualitativa, frente a una simulación CFD tradicional con OpenFOAM, este modelo ofrece una reducción drástica del tiempo de cómputo (de minutos/horas a milisegundos) a cambio de una precisión aproximada y un rango de validez limitado.

## Limitaciones y advertencias

- Número reducido de casos CFD independientes (99) para un espacio de entrada de 4 dimensiones, lo que limita la generalización.
- Solo válido para geometrías NACA de 4 dígitos; no se garantiza la generalización a otras familias de perfiles.
- Número de Reynolds fijo (Re = 3e6) y condiciones de flujo incompresible; no es un modelo de entrada.
- Asume flujo 2D estacionario RANS; no captura efectos 3D ni comportamiento transitorio o no estacionario.
- El coeficiente de arrastre reportado es solo de presión (sin fricción viscosa), por lo que es un límite inferior del Cd total, nunca el Cd total.
- Las predicciones fuera de los rangos de entrenamiento son extrapolaciones sin garantía de precisión; cerca de AoA ≈ 8-9° la precisión se degrada incluso dentro del rango nominal.
- No es un sustituto de CFD: es una herramienta de evaluación aproximada rápida, no un reemplazo de simulaciones de alta fidelidad.

## Enlaces

- HuggingFace: https://huggingface.co/yaga-07/apexflow-surrogate
- GitHub: https://github.com/yaga-07/apexflow
- Demo Space: disponible en la página del modelo en Hugging Face (buscar "ApexFlow" en Hugging Face Spaces)
