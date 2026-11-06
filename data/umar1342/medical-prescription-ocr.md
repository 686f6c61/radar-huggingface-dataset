# Umar1342/medical-prescription-ocr

## Resumen

Medical Prescription OCR es un modelo de visión-lenguaje especializado en la extracción de texto de recetas médicas manuscritas. Lo publica el usuario Umar1342 en Hugging Face como un fine-tuning del modelo Donut (Document Understanding Transformer) de NAVER Clova, concretamente sobre `naver-clova-ix/donut-base`. La arquitectura es un encoder-decoder visión-texto que procesa la imagen completa del documento y genera directamente la secuencia de texto reconocida, sin necesidad de un pipeline OCR separado con detección de regiones.

El modelo resuelve un problema concreto: la digitalización de recetas manuscritas, donde los sistemas OCR genéricos fallan por la variabilidad caligráfica y la terminología médica. Se ha entrenado sobre el dataset `chinmays18/medical-prescription-dataset` con una estrategia de aumentación gradual (rotaciones y brillo en épocas tempranas, transformaciones de perspectiva, sombras y desenfoque de movimiento en épocas posteriores) para mejorar la robustez frente a capturas imperfectas.

Con 202 millones de parámetros y un tamaño de repositorio de 0,8 GB, es un modelo ligero y desplegable en hardware modesto. Es relevante como base para prototipos de digitalización documental en el ámbito sanitario, aunque el propio autor advierte explícitamente de que no está validado para uso clínico. El modelo no registra descargas ni interacciones en el momento de la consulta, por lo que debe considerarse un artefacto de investigación temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder-decoder (Donut, transformer) |
| Parametros totales | 202.053.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación limitada a `max_length=512` en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Donut (Document Understanding Transformer), una arquitectura vision encoder-decoder en la que un encoder visual procesa la imagen del documento y un decoder autorregresivo genera la secuencia de texto objetivo. A diferencia de los pipelines OCR clásicos, Donut no requiere un módulo de detección de texto ni un motor OCR independiente: aprende a mapear píxeles a texto de forma extremo a extremo, lo que simplifica el despliegue y reduce la latencia del pipeline.

El fine-tuning se realizó con PyTorch Lightning sobre el dataset `chinmays18/medical-prescription-dataset`. La estrategia de entrenamiento aplica aumentación gradual: en las primeras épocas solo se aplican transformaciones suaves (ligeras rotaciones y ajustes de brillo) para que el modelo aprenda patrones limpios, y en épocas posteriores se introducen transformaciones de perspectiva, sombras y desenfoque de movimiento para aumentar la robustez. La model card menciona además una clasificación integrada para identificar documentos de receta, aunque no se detalla su implementación. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Extracción de texto de imágenes de recetas médicas manuscritas mediante generación secuencial.
- Reconocimiento de escritura manuscrita con distintos estilos caligráficos, dentro de los límites del dataset de entrenamiento.
- Comprensión de documentos (document understanding) de extremo a extremo, sin detección de regiones previa.
- Clasificación integrada para identificar si un documento es una receta (según la model card, sin detalles técnicos).
- Procesamiento de imágenes con ruido controlado gracias a la aumentación gradual del entrenamiento (rotaciones, sombras, desenfoque).
- Soporte monolingüe en inglés.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No se documenta capacidad de visión general más allá del OCR documental.

## Casos de uso

- Digitalización de recetas en farmacias: el modelo extrae el texto manuscrito de la imagen para volcarlo a un sistema de gestión, reduciendo la transcripción manual. Adecuado por su especialización en caligrafía médica y su despliegue ligero.
- Prototipos de historia clínica electrónica: integración en un pipeline que recibe una foto de receta y devuelve texto para revisión por parte del personal sanitario. El modelo sirve como primer paso de extracción, siempre con verificación humana.
- Investigación en document understanding sanitario: uso como baseline fine-tuneado de Donut para comparar estrategias de aumentación o arquitecturas en tareas de OCR manuscrito.
- Proyectos educativos de tecnología sanitaria: demostraciones de OCR médico en cursos y talleres, gracias a su licencia MIT y a su reducido tamaño (0,8 GB de repositorio).
- Preprocesado de datasets médicos: extracción masiva de texto de imágenes de recetas para construir corpus anotados que alimenten modelos posteriores.
- Aplicaciones de accesibilidad: conversión de recetas manuscritas a texto legible o voz para pacientes con dificultades de lectura, con revisión profesional obligatoria.
- Filtrado y clasificación documental: uso de la clasificación integrada para separar recetas del resto de documentos en un flujo de digitalización.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Character-level accuracy | 71% |
| Word-level accuracy | 84% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son las reportadas por el autor en la model card y no se acompañan de comparación con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 202 millones de parámetros, la inferencia en fp32 requiere aproximadamente 0,8 GB de pesos, y en fp16 alrededor de 0,4 GB, más el overhead del encoder visual y de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `VisionEncoderDecoderModel` y `DonutProcessor` (el método documentado). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI; al ser un modelo visión-lenguaje con encoder visual, estos motores de texto no son directamente aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Umar1342/medical-prescription-ocr | 202 M | no disponible | OCR de recetas manuscritas | MIT | Hugging Face |
| naver-clova-ix/donut-base | no disponible en la informacion | no disponible | Document understanding general | MIT | Hugging Face |
| VarshiniE25/medical-prescription-ocr (MedScript AI) | no disponible | no disponible | OCR de recetas con salida JSON | no disponible | GitHub |

La comparación con Donut base es la más directa, ya que este modelo es un fine-tuning suyo: Donut base es de propósito general y no está especializado en caligrafía médica, mientras que este modelo incorpora el dominio y la aumentación específica. MedScript AI es un proyecto independiente con objetivos parecidos (extracción de texto y salida estructurada en JSON), pero no se dispone de datos de parámetros ni de licencia en la información consultada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no está validado para uso clínico y no debe emplearse para diagnóstico médico ni verificación de recetas.
- Entrenado principalmente con recetas en inglés; el rendimiento en otros idiomas no está garantizado.
- El rendimiento varía según la calidad de la caligrafía; las escrituras muy ilegibles degradan la precisión.
- Puede fallar con nombres de fármacos poco frecuentes o abreviaturas médicas no vistas en el entrenamiento.
- Mejores resultados con imágenes claras y bien iluminadas; imágenes borrosas o con sombras intensas reducen la exactitud.
- Riesgo de alucinación: al ser un modelo generativo, puede producir texto plausible pero incorrecto, especialmente en secuencias largas o ambiguas.
- La precisión reportada (71% a nivel de carácter, 84% a nivel de palabra) implica que una fracción significativa de caracteres y palabras se extrae mal, por lo que toda salida requiere verificación humana.
- Consideraciones de privacidad: procesar documentos médicos implica tratar datos personales sensibles; debe garantizarse el cumplimiento normativo (RGPD) en producción.
- Licencia MIT: permite uso comercial, pero la ausencia de validación clínica traslada al integrador toda la responsabilidad sobre el uso.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere escasa validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Umar1342/medical-prescription-ocr
- Modelo base Donut: https://huggingface.co/naver-clova-ix/donut-base
- Dataset de entrenamiento: https://huggingface.co/datasets/chinmays18/medical-prescription-dataset
- Repositorio GitHub citado en la model card: https://github.com/JonSnow1807/medical-prescription-ocr
- Proyecto relacionado MedScript AI: https://github.com/VarshiniE25/medical-prescription-ocr/tree/main/
