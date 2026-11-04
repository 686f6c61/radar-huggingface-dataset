# turasa22/klasifikasibijikopiconvnext

## Resumen

El repositorio `turasa22/klasifikasibijikopiconvnext` es el material de acompañamiento oficial del manuscrito "Flat versus Cascade CNN Architectures for Coffee Bean Classification", firmado por Nur Fathur Rachman y Cucun Very Angkoso (Universidad de Trunojoyo Madura, Indonesia), con certificado de derechos de autor indonesio HKI n.º 001554369. No se trata de un modelo de lenguaje, sino de un conjunto de pesos de clasificación de imágenes basados en ConvNeXt, entrenados específicamente para distinguir variedades y grados de tostado de granos de café.

El repositorio incluye dos variantes arquitectónicas: una red plana ("Flat") que clasifica directamente entre 16 clases (variedad de café cruzada con nivel de tueste) y una arquitectura en cascada ("Cascade") que primero identifica la variedad y después aplica especialistas de tueste por etapa. Los pesos se distribuyen como checkpoints de PyTorch (`.pth`) para cinco particiones estratificadas, junto con el dataset preprocesado, informes de métricas y cuadernos Jupyter reproducibles con semilla fija (`seed = 42`).

Su relevancia es acotada pero clara para el nicho de visión por computador aplicada a agricultura y control de calidad agroalimentario: ofrece un pipeline completo y reproducible (datos, pesos, métricas y código) bajo licencia permisiva, algo poco habitual en publicaciones de clasificación fina. El repositorio ocupa 3,5 GB y no registra descargas ni interacciones en HuggingFace en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN basada en ConvNeXt (variante Flat y variante Cascade con especialistas de etapa 2) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224 × 224 píxeles) |
| Tipos de cuantización | no disponible (pesos distribuidos en precisión de entrenamiento, `.pth`) |
| Idiomas soportados | en, id (etiquetas y documentación) |
| Licencia | CC BY 4.0 para dataset y pesos; MIT para código y cuadernos |
| Formato de pesos | PyTorch `.pth` (checkpoints por fold) |

## Arquitectura y entrenamiento

El modelo emplea una columna vertebral ConvNeXt para clasificación de imágenes. La variante Flat añade una cabeza de clasificación de 16 clases que cubre simultáneamente la variedad de café y el nivel de tueste. La variante Cascade descompone el problema: una primera etapa identifica la variedad y, a continuación, cuatro especialistas de etapa 2 (uno por fold) refinan el nivel de tueste. Esta descomposición jerárquica es la hipótesis central del manuscrito, que compara ambas estrategias frente a siete backbones distintos en el denominado "Experiment B".

El entrenamiento se realizó sobre un dataset de 1.600 granos individuales únicos, distribuidos en 16 clases que combinan variedad y tueste, con imágenes de 224 × 224 píxeles preprocesadas mediante CLAHE aplicado al canal de luminancia en espacio de color CIE LAB. La evaluación sigue un esquema de validación cruzada estratificada de 5 folds, con informes out-of-fold (OOF), matrices de confusión de 16 × 16 e historiales de entrenamiento. No se documenta en la información disponible el número de épocas, la función de pérdida, el optimizador ni si se aplicaron técnicas de aumento de datos más allá del preprocesado descrito.

## Capacidades

- Clasificación de imágenes de granos de café en 16 clases que cruzan variedad y nivel de tueste.
- Clasificación jerárquica en dos etapas mediante la variante Cascade (variedad y después tueste).
- Clasificación fina ("fine-grained visual categorization") sobre imágenes de 224 × 224 píxeles.
- Evaluación reproducible con validación cruzada de 5 folds y semilla fija.
- Comparación de arquitecturas frente a siete backbones de referencia en el Experiment B.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso: es un clasificador de visión puro.
- Capacidades multilingües limitadas a la documentación en inglés e indonesio; las etiquetas de clase no se detallan en la información disponible.

## Casos de uso

- Control de calidad en tostadoras de café: el clasificador puede asignar cada grano a su variedad y grado de tueste, permitiendo auditar lotes y detectar desviaciones del perfil objetivo antes del envasado.
- Clasificación en línea sobre cintas transportadoras: al operar con entradas de 224 × 224 píxeles y una CNN ConvNeXt, es viable integrarlo en un pipeline de visión industrial con cámara fija y preprocesado CLAHE replicable.
- Investigación académica en clasificación fina: el repositorio entrega pesos, folds, matrices de confusión y cuadernos con semilla fija, lo que facilita la reproducción y la comparación con nuevos backbones.
- Trazabilidad y etiquetado de variedades: la variante Cascade separa la identificación de variedad del tueste, lo que permite reutilizar el especialista de variedad cuando se añadan nuevos niveles de tueste.
- Formación y docencia en visión por computador: sirve como caso de estudio completo de comparación entre arquitecturas planas y jerárquicas con métricas OOF.
- Desarrollo de aplicaciones móviles o de borde para catadores: los checkpoints ConvNeXt pueden exportarse y ejecutarse en dispositivos con aceleración, aunque la información disponible no detalla procesos de exportación a ONNX o TFLite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio referencia informes de métricas por fold, matrices de confusión de 16 × 16 y tablas comparativas del Experiment B con siete backbones, pero los valores numéricos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño concreto del backbone ConvNeXt, que no se especifica en la información proporcionada).
- GPU recomendadas: no disponible; por la naturaleza de ConvNeXt y entradas de 224 × 224, es esperable que quepa en GPU de consumo, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el repositorio no detalla requisitos mínimos.
- Opciones de despliegue: los pesos son checkpoints de PyTorch (`.pth`), por lo que el despliegue natural es PyTorch o TorchScript; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turasa22/klasifikasibijikopiconvnext | ConvNeXt Flat y Cascade para café | no disponible | 224 × 224 píxeles | CC BY 4.0 (pesos), MIT (código) | HuggingFace, 0 descargas |
| ConvNeXt base (Meta) | CNN de propósito general | ~89 M (variante base) | 224 × 224 píxeles | MIT | Pesos públicos ampliamente disponibles |
| EfficientNet-B0 (Google) | CNN de propósito general | ~5,3 M | 224 × 224 píxeles | Apache 2.0 | Pesos públicos ampliamente disponibles |
| ViT-B/16 (Google) | Transformer de visión | ~86 M | 224 × 224 píxeles | Apache 2.0 | Pesos públicos ampliamente disponibles |

La comparación con backbones genéricos es orientativa: el modelo de turasa22 está especializado en 16 clases de café y no compite en tareas generales de visión. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica granos de café en las 16 clases del dataset; no generaliza a otras tareas de visión.
- Dataset pequeño (1.600 imágenes únicas), lo que aumenta el riesgo de sobreajuste y limita la robustez ante condiciones de captura distintas (iluminación, fondo, cámara).
- El preprocesado es parte del modelo: requiere replicar exactamente el recorte a 224 × 224 y el CLAHE sobre el canal de luminancia en CIE LAB para obtener resultados comparables.
- No hay información sobre sesgos demográficos ni de otro tipo, pero al ser un clasificador de productos agrícolas el riesgo de sesgo relevante es el de variedades subrepresentadas en el dataset.
- Riesgo de alucinación no aplica en sentido estricto, pero sí de clasificación errónea fuera de distribución; no se documentan umbrales de confianza ni mecanismos de rechazo.
- Licencia CC BY 4.0 en pesos y dataset: permite uso comercial con atribución; el código y los cuadernos están bajo MIT.
- No se documentan requisitos de hardware, latencia ni proceso de exportación a formatos de despliegue, lo que dificulta una puesta en producción sin trabajo adicional.
- Repositorio sin descargas ni validación externa en HuggingFace; la reproducibilidad depende de los cuadernos incluidos, no de una comunidad activa.

## Enlaces

- HuggingFace: https://huggingface.co/turasa22/klasifikasibijikopiconvnext
- Manuscrito asociado: "Flat versus Cascade CNN Architectures for Coffee Bean Classification" (Nur Fathur Rachman & Cucun Very Angkoso, Universitas Trunojoyo Madura); no se proporciona URL en la información disponible.
- Certificado de derechos de autor indonesio HKI n.º 001554369 (referenciado en la model card; sin URL).
- Contenido del repositorio: `Dataset_Split2.zip`, `01_Model_Weights_Final/`, `02_Reports_and_Metrics/`, `03_Jupyter_Notebooks/` (accesibles desde la página de HuggingFace).
