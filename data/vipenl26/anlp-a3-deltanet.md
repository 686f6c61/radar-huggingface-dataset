# vipenl26/anlp-a3-deltanet

## Resumen

anlp-a3-deltanet es un modelo de secuencia decoder-only de tipo DeltaNet desarrollado por el usuario vipenl26 como parte de la asignación 3 (Parte A) del curso ANLP Monsoon 2026. Se trata de una implementación desde cero en PyTorch, sin dependencias de `mamba-ssm` ni `fla`, con 4.016.640 parámetros, 12 capas y una dimensión de modelo de 256. El modelo fue entrenado como prefix LM sobre pares cifrado-texto plano para una tarea de descifrado académico.

La relevancia del modelo es exclusivamente didáctica: sirve como referencia de implementación de una arquitectura DeltaNet a pequeña escala y como artefacto reproducible de una práctica universitaria. No está pensado para uso en producción ni como modelo de propósito general. Su ventana de contexto es de solo 256 tokens y su vocabulario y datos de entrenamiento no están documentados en la información disponible.

Cabe destacar una advertencia del propio autor: el cifrado liberado es un one-time pad por posición estadísticamente independiente del texto plano, por lo que los checkpoints se comportan como modelos de lenguaje a nivel de carácter con una señal exacta de longitud, no como descifradores reales. La accuracy de validación reportada es de 0,7118 a nivel de token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeltaNet decoder-only (implementación propia en PyTorch) |
| Parámetros totales | 4.016.640 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,0 GB en Hugging Face; se carga mediante `load_checkpoint`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con mecanismo de atención DeltaNet, una variante de atención lineal con actualización delta sobre el estado recurrente. La implementación es desde cero en PyTorch, sin usar las librerías `mamba-ssm` ni `fla`, lo que la hace útil como referencia educativa. La configuración es de 12 capas con `d_model = 256` y una longitud máxima de secuencia de 256 tokens. El coste analítico es de 2.586.574.840 FLOPs por secuencia de 256 tokens.

El entrenamiento se realizó como prefix LM sobre secuencias con el formato `[BOS] ciphertext [SEP] plaintext [EOS]`, calculando la pérdida únicamente sobre el span de texto plano. Se usó una tasa de aprendizaje de 0,001 y se reporta una accuracy de validación a nivel de token de 0,7118. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La condicionalización por cifrado está marcada como "real" en la model card.

## Capacidades

- Modelado de lenguaje a nivel de carácter sobre secuencias cortas (hasta 256 tokens).
- Condicionalización por un prefijo de cifrado para predecir el texto plano asociado, en el formato prefix LM.
- Aprendizaje de la longitud del texto plano a partir del cifrado, según el análisis del autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el vocabulario y los idiomas no están disponibles.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción académica de la asignación: el checkpoint permite verificar los resultados de la práctica ANLP Monsoon 2026 (Parte A) y comparar la implementación propia de DeltaNet con otras variantes.
- Estudio de arquitecturas de atención lineal: sirve como ejemplo mínimo y ejecutable de DeltaNet en PyTorch para quienes quieran inspeccionar el flujo de estado recurrente sin depender de librerías externas.
- Referencia para prácticas de prefix LM: el formato `[BOS] ciphertext [SEP] plaintext [EOS]` con pérdida solo en el span de salida es un patrón reutilizable en ejercicios de modelado condicionado.
- Análisis de límites del cifrado one-time pad: el propio autor documenta que el modelo solo recupera la longitud del texto plano, lo que lo convierte en un caso de estudio sobre qué información es estadísticamente recuperable de un cifrado.
- Docencia de tokenización a nivel de carácter: con contexto de 256 tokens y vocabulario pequeño, es adecuado para demostrar pipelines completos de entrenamiento e inferencia en un portátil.
- Pruebas de infraestructura de carga de checkpoints: el helper `load_checkpoint` y el patrón de `snapshot_download` sirven para validar flujos de descarga y carga en CUDA en entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la accuracy de validación a nivel de token de 0,7118.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 4.016.640 parámetros (aproximadamente 16 MB de pesos en fp32), más el estado recurrente y activaciones para secuencias de 256 tokens.
- GPU recomendadas: cualquier GPU con CUDA disponible; el ejemplo de la model card usa `device="cuda"`, pero el modelo es lo bastante pequeño para ejecutarse en CPU.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050 o superiores, y en la mayoría de portátiles.
- Opciones de despliegue: carga mediante `huggingface_hub.snapshot_download` y el helper `part1.hf_utils.load_checkpoint` del repositorio del autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| anlp-a3-deltanet | 4.016.640 | 256 | MIT | Hugging Face (repo vacío de 0,0 GB) | Implementación propia de DeltaNet, uso académico |
| Alternativas DeltaNet de referencia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |
| Modelos de descifrado tipo seq2seq | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- El propio autor advierte que el cifrado es un one-time pad por posición estadísticamente independiente del texto plano: el modelo solo recupera la longitud, no descifra. No debe interpretarse como un descifrador funcional.
- Contexto muy limitado: 256 tokens, insuficiente para la mayoría de aplicaciones reales.
- Entrenado para una tarea académica concreta; no es un modelo de propósito general.
- No se documentan idiomas soportados, composición del dataset ni sesgos conocidos.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje, agravado por el tamaño reducido y la falta de documentación sobre los datos.
- El repositorio aparece con tamaño de 0,0 GB en Hugging Face, lo que puede indicar que los pesos no están publicados o que la información de tamaño no es fiable; conviene verificar antes de depender de él.
- Licencia MIT permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- No se documentan restricciones adicionales de uso, pero la naturaleza académica del artefacto desaconseja su despliegue en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/vipenl26/anlp-a3-deltanet
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
