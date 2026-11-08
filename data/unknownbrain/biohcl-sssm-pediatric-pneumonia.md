# unknownBrain/BioHCL-SSSM-Pediatric-Pneumonia

## Resumen

BioHCL-SSSM es un modelo de clasificación de imágenes médicas desarrollado por el usuario unknownBrain (jainamdedhia en Hugging Face), diseñado específicamente para la detección de neumonía pediátrica a partir de radiografías de tórax. El modelo combina una arquitectura híbrida que integra bloques convolucionales jerárquicos con un motor de secuencia basado en modelos de espacio de estados selectivos (SSSM, inspirados en Mamba), junto con una red neuronal informada por física (PINN) para la formulación de la pérdida.

El modelo aborda el problema del diagnóstico automatizado de neumonía en población infantil, un caso de uso clínico donde la disponibilidad de radiólogos pediátricos es limitada. Con 14,01 millones de parámetros y 8,56 GFLOPs, el modelo se posiciona como una alternativa compacta y eficiente frente a arquitecturas convolucionales más pesadas como ResNet-50 o DenseNet-121, manteniendo una precisión declarada del 99,37 % en validación cruzada de 10 pliegues sobre el cohorte pediátrico de Guangzhou (Cell 2018).

La relevancia actual del modelo radica en su enfoque híbrido: combina la extracción de características locales mediante convoluciones multi-kernel con el modelado de dependencias de largo alcance mediante recurrencia lineal O(N) propia de los modelos de espacio de estados, lo que reduce el coste computacional frente a mecanismos de atención tradicionales. El repositorio incluye pesos preentrenados, código modular en PyTorch, resultados de ablación y figuras de explicabilidad (GradCAM, LIME, SHAP).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: convolucional jerárquica + modelo de espacio de estados selectivo (SSSM) + PINN |
| Parámetros totales | 14,01 M (modelo estudiante); el repositorio incluye también una variante baseline ResNet-50 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes; entrada 3 x 224 x 224) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (etiqueta de idioma del repositorio); la tarea es clasificación de imágenes, no procesamiento de lenguaje |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) para checkpoints; código fuente en Python |

## Arquitectura y entrenamiento

La arquitectura BioHCL-SSSM se compone de un extractor de características de doble cadena: por un lado, un bloque convolucional jerárquico con kernels múltiples (3x3, 5x5, 7x7) que captura patrones locales a distintas escalas; por otro, un backbone semántico DenseNet-121 que aporta conectividad densa y reduce la dimensionalidad de 1024 a 256. Ambas ramas se fusionan mediante una compuerta cruzada (cross-gated fusion) junto con un codificador posicional cuadrático. La secuencia resultante se procesa mediante tres bloques de espacio de estados selectivo (SSSM) con dimensión de estado d_state=64, que implementan una recurrencia lineal O(N) y una discretización continua-a-discreta mediante retención de orden cero (ZOH). Finalmente, una conexión de salto de identidad aditiva y un pooling global alimentan la cabeza de clasificación binaria (normal vs. neumonía).

El entrenamiento se realizó sobre el cohorte pediátrico de Guangzhou (Kermany et al., Cell 2018), compuesto por 5.856 imágenes de radiografías de tórax. La formulación de la pérdida incluye un componente BioPINNLoss, que incorpora restricciones informadas por física, aunque la model card no detalla la naturaleza exacta de dichas restricciones ni la composición completa del dataset de entrenamiento. Se realizó una validación cruzada de 10 pliegues sobre 5.232 imágenes agrupadas, y se reportan resultados de ablación para variantes como best_student_bioprior.pt, best_student_single_cnn.pt, best_student_no_positional.pt y baseline_resnet50.pt. No se especifica en la información disponible si se emplearon técnicas de aumento de datos, balanceo de clases o ajuste fino con RLHF/DPO (no aplicable en clasificación de imágenes).

## Capacidades

- Clasificación binaria de radiografías de tórax pediátricas en las categorías normal y neumonía.
- Procesamiento de imágenes de entrada de 3 canales y 224 x 224 píxeles.
- Extracción de características multi-escala mediante convoluciones jerárquicas con kernels de 3x3, 5x5 y 7x7.
- Modelado de dependencias de largo alcance mediante recurrencia lineal O(N) en el motor SSSM.
- Generación de mapas de explicabilidad: la model card menciona figuras de Attention, GradCAM, LIME y SHAP.
- Evaluación mediante validación cruzada de 10 pliegues con métricas de precisión, recall, especificidad, F1 y ROC-AUC.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un clasificador de imágenes, no un modelo generativo).
- Capacidades multilingües no aplicables; el modelo no procesa texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades generativas.

## Casos de uso

- **Triaje automatizado en urgencias pediátricas**: el modelo puede clasificar radiografías de tórax en segundos (8,56 GFLOPs por imagen) para priorizar casos sospechosos de neumonía antes de la revisión por un radiólogo, reduciendo el tiempo de espera en servicios con alta carga asistencial.
- **Segunda opinión en diagnóstico por imagen**: integrado como herramienta de apoyo a la decisión, el modelo puede señalar discrepancias entre su clasificación y la del clínico, activando una revisión adicional en casos dudosos gracias a sus mapas de explicabilidad (GradCAM, SHAP).
- **Cribado poblacional en programas de salud infantil**: dado su bajo coste computacional (14,01 M de parámetros), el modelo puede desplegarse en entornos con recursos limitados para procesar lotes de radiografías en campañas de detección temprana.
- **Investigación en arquitecturas híbridas SSM-convolucionales**: el repositorio incluye código modular y resultados de ablación que permiten a investigadores reproducir y extender el enfoque BioHCL-SSSM a otras tareas de imagen médica.
- **Validación de pipelines de imagen médica**: los checkpoints de validación cruzada de 10 pliegues permiten evaluar la robustez del modelo frente a distintas particiones de datos, útil para equipos que desarrollan sistemas de IA regulatorios.
- **Formación y docencia en IA médica**: el modelo y sus figuras de explicabilidad sirven como caso de estudio para enseñar técnicas de interpretabilidad (LIME, SHAP, GradCAM) aplicadas a diagnóstico asistido por ordenador.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Valor (media ± desv. típica, 10 pliegues) |
|---|---|
| Exactitud (accuracy) | 99,37 % ± 0,33 % |
| Precisión | 0,9969 ± 0,0036 |
| Sensibilidad (recall) | 0,9946 ± 0,0059 |
| Especificidad | 0,9911 ± 0,0103 |
| F1-score | 0,9957 ± 0,0022 |
| ROC-AUC | 0,9929 ± 0,0039 |

Matriz de confusión agrupada (5.232 imágenes): 3.862 verdaderos positivos, 1.337 verdaderos negativos, 12 falsos positivos y 21 falsos negativos (33 errores totales, 99,37 % de exactitud global). El mejor pliegue (Fold 2) alcanzó 99,81 % de exactitud, 0,9987 de F1, 100 % de recall y 99,26 % de especificidad.

La model card menciona una tabla comparativa con estado del arte (results/1_sota_benchmarks_master.csv) sobre el split de test oficial de 624 imágenes de Kermany (234 normales, 390 neumonía), pero los datos de dicha tabla no están disponibles en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 14,01 M de parámetros, los pesos en precisión completa (FP32) ocupan aproximadamente 56 MB; en FP16, unos 28 MB. La VRAM necesaria para inferencia con lotes pequeños es inferior a 1 GB, incluyendo activaciones.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Para entrenamiento o inferencia por lotes a gran escala se recomiendan NVIDIA A100, H100 o RTX 4090; para inferencia individual, una GTX 1650 o superior es adecuada.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, etc.) e incluso en GPUs integradas con suficiente memoria compartida.
- **Opciones de despliegue**: al ser un modelo PyTorch (.pt), puede servirse mediante TorchServe, FastAPI con PyTorch, ONNX Runtime (previa exportación) o Triton Inference Server. No se proporcionan pesos en GGUF ni soporte nativo para llama.cpp u Ollama (no aplicable a este tipo de modelo).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Los 8,56 GFLOPs por imagen sugieren una latencia baja en GPU moderna, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Exactitud declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioHCL-SSSM | 14,01 M | 3 x 224 x 224 | 99,37 % (10-fold CV) | MIT | Hugging Face (unknownBrain) |
| Baseline ResNet-50 (incluido en ablaciones) | ~25,6 M | 3 x 224 x 224 | No disponible en la información | No disponible | Incluido en el repositorio como baseline_resnet50.pt |
| DenseNet-121 (backbone del modelo) | ~8 M | 3 x 224 x 224 | No disponible en la información | No disponible | Usado como componente semántico del propio modelo |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada. La model card menciona una tabla SOTA comparativa, pero sus valores no están incluidos en los datos disponibles.

## Limitaciones y advertencias

- **Sesgo poblacional**: el modelo se entrenó exclusivamente con el cohorte pediátrico de Guangzhou (Cell 2018), por lo que su rendimiento puede degradarse en poblaciones con características demográficas, equipos de rayos X o protocolos de imagen diferentes.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero existe riesgo de falsos negativos (21 en la matriz agrupada) y falsos positivos (12), lo que en un contexto clínico puede derivar en diagnósticos erróneos si se usa sin supervisión facultativa.
- **Limitación de idioma**: el repositorio está etiquetado únicamente en inglés; la documentación y el código no están traducidos a otros idiomas.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, modificación y redistribución, pero no exime del cumplimiento de la normativa sanitaria aplicable (por ejemplo, marcado CE como dispositivo médico en la UE o autorización de la FDA en EE. UU.).
- **Ausencia de validación externa**: los resultados declarados (99,37 % de exactitud) no han sido verificados de forma independiente ni validados en cohortes externas; deben interpretarse con cautela.
- **Modelo no generativo**: no puede emplearse para tareas de texto, razonamiento, código o agentes; su uso está restringido a clasificación de imágenes de radiografía de tórax.
- **Documentación incompleta**: la model card no detalla la composición exacta del dataset de entrenamiento, las técnicas de aumento de datos ni la formulación completa de BioPINNLoss, lo que dificulta la reproducibilidad completa.
- **Advertencia para producción**: cualquier despliegue clínico debe someterse a validación regulatoria y a supervisión humana; el modelo no sustituye el juicio de un profesional sanitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unknownBrain/BioHCL-SSSM-Pediatric-Pneumonia
- Perfil del autor en Hugging Face: https://huggingface.co/unknownBrain
- Repositorio relacionado (ablación single CNN): https://huggingface.co/unknownBrain/chest-xray-pneumonia-sssm-ablation-single_cnn
- Proyecto GitHub relacionado (PneumoDetect AI): https://github.com/aarohichadha/pneumonia-detection-ai
- Dataset de referencia (Kermany et al., Cell 2018): https://huggingface.co/datasets/paultimothymooney/chest-xray-pneumonia
- Paper de referencia citado en los tags (arXiv:2312.07965): https://arxiv.org/abs/2312.07965
