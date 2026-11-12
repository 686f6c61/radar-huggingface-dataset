# xgirls/FLUX.2-klein-4B-OpenVINO-INT4-LoRA

## Resumen

FLUX.2-klein-4B-OpenVINO-INT4-LoRA es una exportación a OpenVINO del modelo de difusión texto-a-imagen FLUX.2 Klein 4B de Black Forest Labs, preparada por el usuario xgirls para su uso con adaptadores LoRA en entornos Intel. El repositorio no contiene pesos LoRA: se trata de un grafo OpenVINO del transformer con compresión de pesos INT4, junto con el codificador de texto y el VAE derivados de la exportación OpenVINO 4B previa del mismo autor. El objetivo es permitir la carga de LoRA compatibles con OpenVINO GenAI sobre una base ya cuantizada, algo que las exportaciones OpenVINO convencionales no exponen de forma directa.

El modelo base es la variante destilada FLUX.2 Klein de 4B parámetros, lo que reduce el número de pasos de inferencia necesarios (el autor valida cuatro pasos a 512x512). El grafo expone los estados ocultos de Klein y las entradas de atención compatibles con LoRA. La licencia es Apache 2.0, heredada del modelo upstream.

La relevancia de esta ficha es acotada: se trata de un artefacto técnico muy específico, con cero descargas y cero likes en el momento de la consulta, validado únicamente en GPU Intel con OpenVINO GenAI 2026.4.1. No es un modelo generalista sino un componente de infraestructura para pipelines de generación de imagen con LoRA sobre hardware Intel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer) FLUX.2 Klein, exportado a grafo OpenVINO |
| Parametros totales | 4B (modelo base FLUX.2-klein-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, sin contexto de texto autoregresivo) |
| Tipos de cuantizacion | INT4 en los pesos del transformer; codificador de texto y VAE heredados de la exportacion OpenVINO 4B |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (grafo OpenVINO); tamano del repo 4.2 GB |

## Arquitectura y entrenamiento

El artefacto es una exportación del transformer de difusión de FLUX.2 Klein 4B a formato OpenVINO, con compresión de pesos INT4. El codificador de texto y el VAE no se reexportan desde cero: provienen de la exportación OpenVINO 4B existente del mismo autor. El grafo resultante expone los estados ocultos de Klein y las entradas de atención preparadas para recibir pesos LoRA, de modo que OpenVINO GenAI pueda aplicar adaptadores sobre la base cuantizada.

No se proporciona información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) más allá de que FLUX.2 Klein 4B es una variante destilada. La model card solo documenta el proceso de exportación y las condiciones de validación: GPU Intel, OpenVINO GenAI 2026.4.1, resolución 512x512, cuatro pasos y guidance 1.0 para el modelo destilado. Tampoco se detalla la metodología de cuantización INT4 aplicada.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline de difusión de FLUX.2 Klein.
- Carga de adaptadores LoRA sobre la base cuantizada, siempre que se conviertan al formato Diffusers y se verifique que todos los pesos coinciden con el transformer.
- Inferencia acelerada en GPU Intel mediante OpenVINO GenAI.
- Generación en pocos pasos gracias a la naturaleza destilada del modelo base (validado con cuatro pasos).
- Generación con imagen de referencia: no validada en esta exportación según la model card.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no aplica a un modelo texto-a-imagen).

## Casos de uso

- Generación de imágenes en estaciones de trabajo con GPU Intel: el grafo OpenVINO permite ejecutar FLUX.2 Klein 4B en hardware Intel sin depender de CUDA, usando OpenVINO GenAI como runtime.
- Personalización de estilo mediante LoRA: un equipo puede entrenar un LoRA en formato Diffusers, convertirlo y aplicarlo sobre esta base INT4 para generar imágenes con un estilo o sujeto concreto, manteniendo la ventaja de memoria de la cuantización.
- Prototipado de pipelines de imagen en entornos con recursos limitados: la compresión INT4 del transformer reduce el espacio de pesos (repo de 4.2 GB) frente a una exportación en precisión completa, lo que facilita el despliegue en equipos con VRAM moderada.
- Integración en aplicaciones de escritorio o edge con OpenVINO: al ser un runtime de Intel, encaja en aplicaciones locales que ya usan OpenVINO para otros modelos y quieren añadir generación de imagen.
- Evaluación comparativa de LoRA sobre bases cuantizadas: útil para investigadores que quieran medir la degradación de calidad al aplicar adaptadores sobre pesos INT4 en lugar de FP16.
- Generación rápida de borradores visuales en cuatro pasos a 512x512: adecuado para iteración rápida de conceptos antes de pasar a un modelo de mayor resolución o precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo fue probado en GPU Intel con OpenVINO GenAI 2026.4.1, a 512x512 y cuatro pasos, sin reportar métricas cuantitativas de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 4.2 GB, lo que da una cota inferior del espacio de pesos; el consumo real de inferencia depende de la resolución, el tamaño de lote y el runtime.
- GPU recomendadas: GPU Intel (única plataforma validada por el autor). No se ha validado en otras GPU.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos sobre funcionamiento en RTX 4090, A100, H100 ni en iGPU Intel concretas.
- Opciones de despliegue: OpenVINO GenAI (versión validada 2026.4.1). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Validacion |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-OpenVINO-INT4-LoRA (este) | 4B | OpenVINO IR | INT4 | Apache 2.0 | GPU Intel, OpenVINO GenAI 2026.4.1 |
| black-forest-labs/FLUX.2-klein-4B (base) | 4B | no disponible en la informacion | no disponible | Apache 2.0 | no disponible |
| Exportacion OpenVINO 4B de xgirls (referenciada) | 4B | OpenVINO IR | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Los LoRA en formato AI-Toolkit/BFL deben convertirse a nombres de capa en formato Diffusers antes de usarse; un LoRA sin convertir puede no tener efecto de forma silenciosa.
- Es necesario verificar que todos los pesos previstos coinciden con el transformer; la model card advierte explícitamente de este riesgo.
- La generación con imagen de referencia no ha sido validada en esta exportación.
- Solo se ha validado en GPU Intel con OpenVINO GenAI 2026.4.1; otros dispositivos no están probados.
- La cuantización INT4 puede degradar la calidad respecto a la base en precisión completa; no se aportan métricas que lo cuantifiquen.
- El repositorio no contiene pesos LoRA pese a su nombre; quien espere un adaptador entrenado encontrará solo el grafo base preparado para LoRA.
- Los sesgos y riesgos de alucinación visual del modelo base no se documentan en esta ficha; la model card remite a las limitaciones documentadas del modelo upstream.
- Uso comercial permitido por la licencia Apache 2.0, sujeta a las condiciones del modelo base.
- Artefacto sin descargas ni validación comunitaria en el momento de la consulta: trátese como experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xgirls/FLUX.2-klein-4B-OpenVINO-INT4-LoRA
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
