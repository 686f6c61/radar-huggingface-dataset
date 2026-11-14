# Xylolabs/clef-Tensix-BFP4-MLP

## Resumen

Clef-Tensix-BFP4-MLP es una exportación cuantizada del modelo Cloudflare/clef, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante la pila TT-NN (tt-metal). No se trata de un modelo generativo: es un modelo de decisión que, dado un estado estructurado y un conjunto de preguntas con opciones permitidas, devuelve una distribución de probabilidad sobre cada opción en una única pasada hacia delante, sin producir texto. El modelo base es un transformer híbrido con capas de atención clásica y DeltaNet, y una cabeza de esquema conjunta (joint schema head) más una tabla léxica que se conservan en BF16.

La relevancia de esta ficha es doble. Por un lado, muestra un caso práctico de cuantización de bloques de coma flotante (block floating point, BFP) orientada a hardware específico: las proyecciones MLP se almacenan en bfloat4_b (4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque, y las proyecciones de atención y DeltaNet en bfloat8_b (8,5 bits por peso). Por otro, evidencia el estado incipiente de este tipo de exportaciones: el repositorio tiene cero descargas y cero valoraciones, y el propio autor advierte de que no se ha validado un runner completo de decisión sobre Tensix.

El modelo cuenta con 27.356.728.560 parámetros totales según los pesos en safetensors, un tamaño de repositorio de 55,0 GB y licencia Apache-2.0. Los idiomas declarados son inglés y coreano, y la calibración de la cuantización empleó 65.536 tokens de WikiText-2 y de Wikipedia en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención clásica y capas DeltaNet; cabeza de esquema conjunta (joint schema head) y tabla léxica en BF16 |
| Parametros totales | 27.356.728.560 (según safetensors) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits/peso, GPTQ con búsqueda de exponente por bloque, damping 0,1) en MLP gate/up/down; BFP8 (bfloat8_b, 8,5 bits/peso, round to nearest) en proyecciones de atención y DeltaNet; BF16 sin cambios en el resto |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como BF16 sobre sus rejillas de bloque); empaquetado nativo TT-NN para Tensix |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef es un transformer híbrido que combina capas de atención clásica con capas DeltaNet, lo que reduce el coste de memoria del estado recurrente frente a una atención completa en todas las capas. Sobre el tronco se sitúa una cabeza de esquema conjunta que evalúa todas las opciones permitidas de cada pregunta en una sola pasada, junto con una tabla léxica de lenguaje original. La exportación conserva en BF16 la cabeza, la tabla léxica, el embedding de entrada, las normas y el codificador de visión; solo se cuantizan las proyecciones del tronco.

El proceso de cuantización es de tipo post-entrenamiento. Las proyecciones MLP gate/up/down usan GPTQ con búsqueda de exponente por bloque sobre rejillas de coma flotante por bloques, con damping de 0,1 y calibración sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención y DeltaNet usan redondeo al más cercano a BFP8. El archivo `quant4.json` documenta el formato de cada proyección. Los 496 tensores cuantizados superan la comprobación de rejilla, el empaquetado nativo de TT-NN y el empaquetado como BFP8, verificado con TT-NN 0.81.1 y el simulador Blackhole. No se documentan detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Decisión sobre opciones cerradas: devuelve una puntuación por cada opción permitida de una pregunta, sin generar texto.
- Soporte de preguntas de tipo elección (`choice`) y de tipo booleano (`noul`), según el ejemplo de la model card.
- Procesamiento de estado estructurado en formato JSON (por ejemplo, facturas con campos de proveedor, importe, divisa y estado).
- Evaluación de múltiples preguntas en una única pasada hacia delante.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos.
- Pesos de visión conservados del modelo base, aunque las entradas de imagen y vídeo no se validaron en esta exportación.
- No soporta generación de texto, tool calling ni razonamiento multi-paso en el sentido de los modelos generativos; su salida es una distribución de probabilidad sobre opciones.

## Casos de uso

- Clasificación documental estructurada: dado un JSON con los campos de una factura o un pedido, el modelo puntúa opciones como "pagada", "vencida" o "borrador" en una sola pasada, lo que encaja en pipelines de validación donde no se necesita texto libre.
- Enrutamiento de tickets de soporte: con un estado que describa el ticket y un conjunto cerrado de categorías, el modelo devuelve la probabilidad de cada categoría y permite umbrales de confianza para escalado manual.
- Verificación de reglas de negocio: preguntas booleanas del tipo "¿el importe supera los 1000 USD?" se responden como una distribución sobre dos opciones, integrable en motores de decisión existentes.
- Moderación con etiquetas cerradas: clasificación de contenido en categorías predefinidas con scores por opción, útil cuando se requiere trazabilidad de la probabilidad asignada a cada etiqueta.
- Extracción de decisiones en coreano e inglés: al estar calibrado con Wikipedia en coreano y declarar ambos idiomas, puede emplearse en flujos bilingües de clasificación de documentación administrativa.
- Despliegue en aceleradores Tenstorrent: el empaquetado BFP4/BFP8 está pensado para ejecutarse sobre Tensix con TT-NN, lo que permite evaluar inferencia de clasificación en hardware alternativo a GPU en entornos de laboratorio.
- Evaluación comparativa de cuantización: sirve como referencia para medir el impacto de BFP4 en MLP frente a BFP8 en atención sobre una tarea de decisión concreta.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con la métrica "Mean option-distribution KL" por perfil de decisión, pero el contenido de la tabla no está disponible en la información proporcionada, por lo que no se pueden reproducir los valores.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo estimada: unos 23,59 GB solo para los pesos retenidos del tronco, la cabeza conjunta y la tabla léxica, más espacio para la caché KV y buffers.
- El archivo de pesos ocupa 55,0 GB porque los valores cuantizados se almacenan como BF16 sobre sus rejillas de bloque; el peso empaquetado real es menor que el archivo.
- GPU: se requiere una GPU CUDA con memoria suficiente para los valores BF16 del archivo; el quickstart usa `device="cuda"` con Transformers 5.23.0 y PyTorch.
- Acelerador Tenstorrent Tensix: verificado con TT-NN 0.81.1 y el simulador Blackhole para las 496 proyecciones cuantizadas.
- No se dispone de datos sobre si cabe en GPU de consumo (RTX 4090 u otras) ni de latencia o throughput estimados.
- Opciones de despliegue: Transformers 5.23.0 con código personalizado (`joint_schema_model`), y empaquetado TT-NN para Tensix. tt-transformers y tt-forge no se comprobaron con este paquete.
- Herramientas auxiliares incluidas: `pack_tensix.py` (comprueba todas las proyecciones cuantizadas, con `--as bfp8` y `--device`) y `verify_grid.py` (verifica la rejilla solo con torch).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base Cloudflare/clef ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/clef-Tensix-BFP4-MLP | 27.356.728.560 | no disponible | Apache-2.0 | safetensors BFP4/BFP8/BF16, TT-NN | Exportación cuantizada para Tensix |
| Cloudflare/clef (base) | no disponible | no disponible | no disponible | no disponible | Modelo de decisión original en BF16 |
| Alternativas de clasificación de mismo tamano | no disponible | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas redactadas queda fuera de su alcance.
- La evaluación de imagen y vídeo no se validó en esta exportación, aunque los pesos de visión se conserven.
- No se ha publicado un runner completo de decisión para Tensix; las herramientas incluidas solo verifican la representación de pesos.
- tt-transformers y tt-forge no se comprobaron con este paquete, lo que limita la integración con esas pilas.
- Idiomas limitados a inglés y coreano; no se declara soporte de castellano.
- La cuantización BFP4 en MLP puede degradar la calibración de las probabilidades; la model card reporta una métrica de KL por perfil de decisión, pero los valores no están disponibles en la información proporcionada.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente en las distribuciones de opciones.
- No se documentan sesgos conocidos ni restricciones adicionales de la licencia Apache-2.0 para uso comercial.
- El repositorio no tiene descargas ni valoraciones, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/clef-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/clef-Tensix-BFP4-MLP/blob/main/LICENSE
