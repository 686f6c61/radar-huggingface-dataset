# ZiyanZhuang/shorkie-lm-165-method-rebuild-v1.1

## Resumen
ShorkieLM 165 method-rebuild v1.1 es una reproducción comunitaria no oficial en PyTorch del modelo Shorkie_LM, un modelo de lenguaje de ADN enmascarado desarrollado originalmente por Calico Life Sciences y la Universidad Johns Hopkins para predecir expresión génica en Saccharomyces cerevisiae. Esta versión concreta, publicada por ZiyanZhuang, reconstruye de forma independiente la arquitectura routed-L2 y el corpus de entrenamiento de 165 genomas fúngicos a partir de Ensembl Fungi release 59, con el objetivo de auditar la reproducibilidad del método original.

El modelo tiene 13,65 millones de parámetros entrenables y acepta secuencias de ADN de 16.384 pares de bases con 170 canales de entrada (4 bases + máscara + 165 especies). Su salida son logits no normalizados para A/C/G/T en cada posición. La licencia es Apache-2.0 y los pesos se distribuyen en formato safetensors. Es relevante porque permite a la comunidad validar de forma independiente los resultados del paper original de Shorkie, que hasta ahora dependía de un corpus propietario.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Routed-L2 (reproducción PyTorch de Shorkie_LM) |
| Parametros totales | 13.665.828 (13.651.812 entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 pares de bases |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de ADN, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo reproduce la arquitectura routed-L2 de Shorkie_LM, un transformer de lenguaje enmascarado sobre ADN. La entrada consiste en 170 canales: cuatro para las bases A/C/G/T, uno para la máscara de MLM y 165 canales de especie (uno por genoma fúngico). Para S. cerevisiae, el índice de especie 109 activa el canal absoluto 114. La salida son cuatro logits no normalizados por posición.

El entrenamiento se realizó con la receta "D": reset del estado de Adam y decaimiento coseno de la tasa de aprendizaje de 3e-5 a 3e-6. El corpus fue reconstruido independientemente a partir de Ensembl Fungi release 59, con 165 genomas, aplicando enmascarado de repeticiones, ventaneado y filtrado siguiendo el método publicado. No se incluye el corpus original de los autores. El checkpoint alcanzó la época 3505 y el paso global 525900.

## Capacidades
- Predicción de bases enmascaradas en secuencias de ADN fúngico de hasta 16.384 pb.
- Generación de representaciones (embeddings) de secuencias para tareas downstream de genómica.
- Soporte de canales de especie para condicionar la predicción a un genoma concreto (165 especies de Saccharomycetales).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de representación biológica.
- No es un modelo de lenguaje natural; no genera texto.

## Casos de uso
- Investigación en regulación génica de levaduras: el modelo puede predecir el efecto de variantes de secuencia en la expresión, sirviendo como base para estudios de regulación transcripcional en S. cerevisiae.
- Auditoría de reproducibilidad científica: permite verificar de forma independiente los resultados del paper original de Shorkie, comparando métricas como la perplejidad en planes de validación congelados.
- Desarrollo de pipelines de genómica comparativa: al incluir 165 especies, puede usarse para estudiar conservación de motivos reguladores entre genomas fúngicos.
- Preentrenamiento para fine-tuning supervisado: sus pesos pueden servir como inicialización para modelos de predicción de cobertura de RNA-seq o ChIP-exo, replicando el enfoque de dos etapas de Shorkie.
- Educación y formación en modelos de lenguaje biológicos: al ser un modelo pequeño (13,6 M de parámetros) y con licencia Apache-2.0, es adecuado para enseñar arquitecturas de MLM sobre ADN.
- Interoperabilidad de formatos: al publicarse en safetensors con un cargador verificable, facilita pruebas de compatibilidad entre frameworks de inferencia.

## Benchmarks y rendimiento
En un plan de validación congelado de 536 ventanas reconstruidas (método-rebuild R64), el modelo alcanzó una perplejidad ponderada global de 3,621104. El oráculo oficial Shorkie_LM obtuvo 3,604430 en las mismas muestras y plan de máscara/RC exacto, lo que supone una diferencia del 0,4626% (peor). El intervalo de bootstrap del 95% para la razón de perplejidad en bloques genómicos de 64 kb es 1,004244-1,005013.

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de lenguaje natural.

## Requisitos de hardware
- VRAM estimada: con 13,6 M de parámetros en precisión fp32, el modelo ocupa aproximadamente 55 MB. Incluso con overhead de activaciones para secuencias de 16.384 pb, cabe en cualquier GPU con más de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior) es suficiente. No requiere GPUs de datacenter.
- Despliegue: al ser un modelo pequeño, puede ejecutarse en CPU sin problemas para inferencia puntual. Para procesamiento por lotes, una GPU acelera la evaluación.
- Opciones de despliegue: el cargador oficial es `shorkie_torch.load_pretrained`, que verifica SHA-256. No hay soporte nativo para vLLM, llama.cpp u Ollama, al ser un modelo especializado de ADN.
- Latencia: no se dispone de datos de latencia publicados, pero por el tamaño del modelo se espera que sea muy baja (del orden de milisegundos por secuencia en GPU).

## Comparativa con modelos similares
No se dispone de una comparativa directa con otros modelos de ADN en la información proporcionada. El modelo más cercano es el Shorkie_LM oficial, del cual esta versión es una reproducción independiente. Otros modelos de lenguaje de ADN como Nucleotide Transformer o DNABERT tienen arquitecturas y objetivos diferentes, y no se han evaluado en las mismas condiciones. Por tanto, la comparativa se limita a la diferencia de perplejidad frente al oráculo oficial, ya descrita en la sección de benchmarks.

## Limitaciones y advertencias
- No es el modelo supervisado de 5.215 pistas usado en las Figuras 3-7 del paper original; solo reproduce la etapa de preentrenamiento no supervisado.
- El corpus de entrenamiento es una reconstrucción independiente, no el corpus original de los autores, por lo que los resultados pueden diferir ligeramente.
- No está validado para uso clínico, diagnóstico, bioseguridad ni otras aplicaciones críticas de seguridad.
- La perplejidad es ligeramente peor que la del oráculo oficial (0,46% de diferencia), dentro del intervalo de confianza del bootstrap.
- No soporta generación de texto ni tareas de lenguaje natural; su uso se limita a genómica.
- El cargador oficial rechaza checkpoints pickle no confiables; se recomienda usar exclusivamente el cargador `shorkie_torch` para evitar riesgos de seguridad.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/ZiyanZhuang/shorkie-lm-165-method-rebuild-v1.1
- Paper original de Shorkie: https://doi.org/10.1101/2025.09.19.677475
- Repositorio oficial del paper: https://github.com/calico/shorkie-paper
- Documentación oficial de Shorkie: https://khchao.com/shorkie/
- Código PyTorch de la reproducción: https://github.com/ZiyanZhuang/shorkie-pytorch
- Página del modelo en bio.rodeo: https://bio.rodeo/models/shorkie
- Guía de entrenamiento de Shorkie: https://khchao.com/shorkie/content/behind_scenes.html
