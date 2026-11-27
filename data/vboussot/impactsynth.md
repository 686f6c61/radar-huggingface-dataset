# VBoussot/ImpactSynth

## Resumen

ImpactSynth (TotalSynth) es un conjunto de modelos de síntesis de TC (synthetic CT, sCT) a partir de imágenes de resonancia magnética (MRI) y tomografía computarizada de haz cónico (CBCT). Lo desarrolla VBoussot y se distribuye bajo licencia Apache 2.0. Resuelve un problema clínico concreto en radioterapia: la planificación de dosis requiere TC con unidades Hounsfield calibradas, pero la MRI ofrece mejor contraste de tejidos blandos y la CBCT está disponible en el propio acelerador; generar un TC sintético a partir de esas modalidades evita exploraciones adicionales y dosis de radiación extra al paciente.

El modelo cubre el cuerpo completo, desde la cabeza hasta la pelvis, y se apoya en la librería KonfAI. La red es una U-Net++ 2.5D con codificador ResNet-34 de 26,1 millones de parámetros: recibe cinco cortes axiales adyacentes y predice el TC del corte central. Se publican cuatro variantes (`MR`, `CBCT`, `MR_CBCT` y `Finetune`), cada una con cinco checkpoints de validación cruzada que pueden combinarse en un ensemble en inferencia.

Es relevante ahora porque unifica en un único modelo la síntesis desde dos modalidades distintas, incluye estimación de incertidumbre, utilidades de evaluación y flujo de reajuste fino local, y porque los pares de entrenamiento y los campos de deformación empleados están publicados, lo que permite auditar la supervisión. Todo ello lo sitúa como una herramienta práctica para investigación en radioterapia guiada por imagen, no como un producto clínico validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net++ 2.5D con codificador ResNet-34 |
| Parametros totales | 26,1 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; parche axial de 512 × 512 y 5 cortes de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints `.pt` (PyTorch) gestionados por KonfAI; repo de 13,6 GB |
| Modalidades de entrada | MRI y CBCT |
| Modalidad de salida | TC sintético en unidades Hounsfield |
| Resolución de trabajo | remuestreo a 1 × 1 × 3 mm |
| Checkpoints por app | 5 (CV_0 a CV_4), combinables en ensemble |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

La red es una U-Net++ 2.5D con codificador ResNet-34. El enfoque 2.5D procesa cinco cortes axiales consecutivos como canales de entrada y genera el TC del corte central, lo que aporta contexto volumétrico sin la carga computacional de una convolución 3D completa. Cada app incluye cinco checkpoints de validación cruzada que se promedian en inferencia, con aumento de test mediante volteo (`--tta 2` por defecto). El preprocesado predice una máscara corporal con ImpactSeg, la dilata cinco vóxeles, remuestrea la entrada a 1 × 1 × 3 mm, la recorta entre su mínimo y el percentil 99,5 y la escala a [-1, 1].

El entrenamiento usa pares de los retos públicos SynthRAD2023 (cerebro, pelvis) y SynthRAD2025 (cabeza y cuello, tórax, abdomen), más cuatro cohortes de próstata. El TC de planificación se registró a cada MRI o CBCT con IMPACT-Reg, cada deformación fue revisada y se conservaron 1450 de los 1800 pares públicos. La variante `MR` usa 805 pares MRI/TC, la `CBCT` 929 pares CBCT/TC y `MR_CBCT` los 1734 pares conjuntos. La variante `Finetune` parte del modelo `MR` y se reajusta sobre 45 casos de MRI corporal total Dixon (BIC-MAC). Los campos de deformación y los ficheros de partición están publicados para inspección de la supervisión.

## Capacidades

- Síntesis de TC a partir de MRI en regiones de cerebro, pelvis, cabeza y cuello, tórax y abdomen.
- Síntesis de TC a partir de CBCT en las mismas regiones anatómicas.
- Modelo unificado (`MR_CBCT`) que acepta indistintamente MRI o CBCT con una sola red.
- Cobertura de cuerpo completo, desde la cabeza hasta la pelvis.
- Ensemble de hasta cinco checkpoints de validación cruzada para reducir varianza.
- Aumento de test (volteo) configurable en inferencia.
- Estimación de incertidumbre a partir de la pila de inferencia, sin necesidad de TC de referencia.
- Evaluación integrada: MAE, PSNR, SSIM, Dice de estructuras de TotalSegmentator sobre sCT y TC, distancia perceptual en el espacio de características de SAM 2.1 y término de registro basado en IMPACT entre el sCT y su entrada.
- Reajuste fino local sobre pares propios con la configuración de entrenamiento incluida.
- Ejecución desde línea de comandos, desde Python y como extensión de 3D Slicer.
- No soporta tool calling, agentes ni procesamiento de lenguaje: es un modelo puramente de imagen.

## Casos de uso

- Planificación de radioterapia basada en MRI: generar el TC sintético necesario para el cálculo de dosis a partir de la MRI de planificación, aprovechando el contraste de tejidos blandos de la resonancia y evitando una TC adicional.
- Cálculo de dosis en el acelerador con CBCT: sintetizar un TC calibrado en Hounsfield a partir de la CBCT adquirida durante la sesión para verificar o recalcular la dosis del día, gracias al modelo `CBCT` entrenado con 929 pares.
- Reajuste fino por centro: adaptar los pesos publicados a la población local con la variante `Finetune` o con `konfai-apps fine-tune`, útil cuando la distribución de imágenes difiere de los datos de SynthRAD.
- Control de calidad e investigación: usar las utilidades de evaluación (MAE, SSIM, PSNR, Dice con TotalSegmentator, distancia perceptual en SAM 2.1) para comparar pipelines de síntesis sobre cohortes propias.
- Cuantificación de incertidumbre: emplear la opción `-uncertainty` para obtener la dispersión del ensemble y decidir qué regiones del sCT requieren revisión manual antes de usarse.
- Integración en flujos clínicos existentes: ejecutar la síntesis dentro de 3D Slicer mediante la extensión ImpactSynth, con el sCT superpuesto sobre la imagen de entrada.
- Procesado por lotes en servidor: desplegar `konfai-apps-server` con `--host` y `--port` para sintetizar series de forma centralizada en un servicio de imagen médica.
- Segmentación de estructuras sobre sCT: alimentar TotalSegmentator con el TC sintético para obtener contornos de órganos de riesgo en estudios donde solo se dispone de MRI o CBCT.

## Benchmarks y rendimiento

Casos reservados; métricas calculadas dentro de la máscara corporal frente al TC registrado (media ± desviación estándar).

| Modelo | Dominio de evaluacion | MAE (HU) | SSIM | PSNR (dB) |
|---|---|---|---|---|
| `MR` | MRI/TC, 140 casos | 67,49 ± 15,97 | 0,920 ± 0,025 | 29,28 ± 2,10 |
| `CBCT` | CBCT/TC, 150 casos | 53,55 ± 17,79 | 0,939 ± 0,026 | 32,09 ± 2,93 |
| `MR_CBCT` | entradas MRI | 67,68 ± 16,42 | 0,920 ± 0,025 | 29,22 ± 2,18 |
| `MR_CBCT` | entradas CBCT | 54,22 ± 17,54 | 0,938 ± 0,025 | 31,89 ± 2,87 |
| `MR`, directo | BIC-MAC, externo, 15 sujetos | 100,91 ± 18,67 | 0,968 ± 0,007 | 26,69 ± 1,40 |
| `Finetune` | BIC-MAC, externo, 15 sujetos | 62,21 ± 6,19 | 0,982 ± 0,002 | 30,45 ± 0,92 |

MAE por región anatómica, en HU:

| Modelo | Cerebro | Pelvis | Cabeza y cuello | Torax | Abdomen | CSIRO (MRI) |
|---|---|---|---|---|---|---|
| `MR` | 79,7 | 48,2 | 80,9 | 58,5 | 60,1 | 76,0 |
| `CBCT` | 39,4 | 34,8 | 67,5 | 57,3 | 57,2 | no disponible |

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM en la información disponible. Como referencia, la red tiene 26,1 M de parámetros y trabaja con parches axiales de 512 × 512; el consumo vendrá dominado por las activaciones de la U-Net++ y por el número de checkpoints del ensemble.
- Las instrucciones de uso emplean `--gpu 0`, lo que presupone una GPU dedicada; no se detalla el modelo mínimo.
- El ensemble de cinco checkpoints con aumento de test multiplica el coste de inferencia por cinco (o por diez con `--tta 2`); conviene dimensionar la VRAM y el tiempo según el número de checkpoints seleccionados.
- No se indican GPU concretas recomendadas (A100, H100, RTX 4090 u otras) en la información disponible.
- El repo ocupa 13,6 GB, por lo que conviene prever espacio en disco para los pesos y los ficheros de configuración.
- Opciones de despliegue: CLI `impact-synth-konfai` (paquete `impact_synth_konfai`), runner genérico `konfai-apps infer`, servidor `konfai-apps-server` con `--host` y `--port`, y extensiones de 3D Slicer (ImpactSynth y KonfAI).
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | MAE (HU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImpactSynth `MR` | 26,1 M | MRI, 5 cortes axiales | 67,49 (MRI/TC) | Apache 2.0 | Hugging Face, CLI, Slicer |
| ImpactSynth `CBCT` | 26,1 M | CBCT, 5 cortes axiales | 53,55 (CBCT/TC) | Apache 2.0 | Hugging Face, CLI, Slicer |
| ImpactSynth `MR_CBCT` | 26,1 M | MRI o CBCT | 67,68 / 54,22 | Apache 2.0 | Hugging Face, CLI, Slicer |
| Alternativas de síntesis de TC | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de otros modelos de síntesis de TC comparables, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- No es un dispositivo médico validado: el propio autor advierte de validar sobre datos propios antes de cualquier uso clínico.
- Sensibilidad al cambio de dominio: en la cohorte externa BIC-MAC con MRI corporal total Dixon, la variante `MR` sube a 100,91 HU de MAE; el reajuste fino con 45 casos locales lo reduce a 62,21 HU. Es esperable un deterioro similar con protocolos de adquisición alejados del entrenamiento.
- El error varía mucho por región: en cerebro y cabeza y cuello el MAE de la variante `MR` ronda 80 HU, frente a 48,2 HU en pelvis.
- Los datos de entrenamiento proceden de retos públicos (SynthRAD2023, SynthRAD2025 y cohortes de próstata); la cobertura de anatomías y equipos fuera de ese conjunto es limitada.
- La calidad depende del registro entre modalidades: aunque las deformaciones fueron revisadas, los errores de registro se propagan a la supervisión.
- La estimación de incertidumbre se basa en la dispersión del ensemble y no en una calibración probabilística explícita.
- Riesgo de artefactos o valores Hounsfield poco realistas en zonas de hueso, aire o implantes metálicos; no se documenta un tratamiento específico de artefactos metálicos.
- Uso comercial permitido por Apache 2.0, pero sin garantías del autor; la responsabilidad regulatoria recae en el implementador.
- No se documentan sesgos demográficos ni evaluación por subgrupos de población.
- No aplica a tareas de texto, código o agentes; cualquier uso fuera de la síntesis de imagen médica queda fuera de su diseño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VBoussot/ImpactSynth
- Paper TotalSynth: https://arxiv.org/abs/2609.13838
- Paper referenciado: https://arxiv.org/abs/2510.21358
- Paper referenciado: https://arxiv.org/abs/2508.09823
- KonfAI (librería): https://github.com/fideus-labs/KonfAI
- Extensión ImpactSynth para 3D Slicer: https://github.com/vboussot/SlicerImpactSynth
- Extensión KonfAI para 3D Slicer: https://github.com/vboussot/SlicerKonfAI
- ImpactSeg (máscara corporal): https://huggingface.co/VBoussot/ImpactSeg
- Dataset de registro SynthRAD2023: https://huggingface.co/datasets/VBoussot/synthrad2023-impact-registration
- Dataset de registro SynthRAD2025: https://huggingface.co/datasets/VBoussot/synthrad2025-impact-registration
