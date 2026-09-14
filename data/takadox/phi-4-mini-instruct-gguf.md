# TAKADOX/Phi-4-mini-instruct-GGUF

## Resumen

TAKADOX/Phi-4-mini-instruct-GGUF es una redistribución en formato GGUF del modelo microsoft/Phi-4-mini-instruct, publicada por el usuario TAKADOX. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de pesos del modelo base de Microsoft a cuantizaciones GGUF orientadas a inferencia local con llama.cpp y herramientas compatibles. El modelo subyacente pertenece a la familia Phi-4 y está diseñado para razonamiento denso con un tamaño compacto de 3.836.021.856 parámetros (aproximadamente 3,8 mil millones), lo que lo sitúa en la gama de modelos pequeños aptos para hardware de consumo.

El modelo base es un transformer denso decoder-only entrenado con datos sintéticos y sitios web públicos filtrados, y ha pasado por un proceso de ajuste supervisado (SFT) y optimización directa de preferencias (DPO) para mejorar el seguimiento de instrucciones y la seguridad. Soporta una longitud de contexto de 128.000 tokens según la model card. La licencia declarada es MIT, lo que permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de copyright correspondiente.

La relevancia de esta ficha concreta es limitada pero práctica: el repositorio aplica las correcciones de errores de Unsloth sobre la plantilla de chat y los tokens especiales del modelo original, lo que evita problemas conocidos de terminación prematura durante la inferencia. Sin embargo, el repositorio presenta 0 descargas y 0 «likes» en el momento de la consulta, no incluye benchmarks propios y no detalla el listado exacto de cuantizaciones incluidas, por lo que debe tratarse como una alternativa no validada por la comunidad frente a otras conversiones GGUF más establecidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (etiqueta `phi3` en HuggingFace, con `custom_code`); no es MoE |
| Parámetros totales | 3.836.021.856 (≈3,8 B) |
| Parámetros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | 128.000 tokens (según la model card del repositorio) |
| Tipos de cuantización | GGUF con cuantizaciones dinámicas de Unsloth; el repositorio no detalla el listado exacto de niveles incluidos. El tamaño del repo (24,1 GB) sugiere que agrupa varios niveles, presumiblemente desde cuantizaciones de 4 bits hasta F16/BF16 |
| Idiomas soportados | Declarado como `multilingual`; no se especifica el listado de idiomas en la información disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repositorio). El modelo base se distribuye en safetensors |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Tamaño del repositorio | 24,1 GB |
| Descargas / likes | 0 / 0 |
| Librería declarada | transformers |
| Fecha de creación / actualización | 2026-09-14 (misma fecha para ambos campos) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso decoder-only, sin mezcla de expertos ni componentes de estado recurrente (SSM). La model card lo describe como un modelo ligero construido sobre datos sintéticos y sitios web públicos filtrados, con énfasis en datos densos en razonamiento. El proceso de entrenamiento incluyó ajuste supervisado (SFT) y optimización directa de preferencias (DPO), orientados a mejorar la adherencia precisa a las instrucciones y a incorporar medidas de seguridad robustas. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni la proporción entre datos sintéticos y datos web.

Sobre el repositorio concreto, la model card reproduce la plantilla de Unsloth e indica que se han aplicado cuatro correcciones respecto al modelo original: unificar el token de padding y el de EOS; eliminar un token EOS extra de la plantilla de chat que provocaba la aparición de `<|end|>` durante la inferencia; establecer `<|end|>` (en lugar de `<|endoftext|>`) como token EOS para evitar terminaciones prematuras; y cambiar el `unk_token` de EOS a `�`. Las cuantizaciones dinámicas de Unsloth se describen como cuantizaciones selectivas pensadas para mejorar la precisión frente a un 4 bits estándar. No se documenta el proceso de conversión específico aplicado por TAKADOX ni se publican hashes o métricas de perplejidad de las cuantizaciones.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia (ChatML con tokens `<|end|>`), orientada a diálogo multi-turno.
- Razonamiento y matemáticas: las etiquetas del repositorio incluyen `math`; el modelo base está entrenado sobre datos densos en razonamiento, aunque no se aportan métricas que lo cuantifiquen.
- Generación de código: la etiqueta `code` está presente, pero no se adjuntan evaluaciones tipo HumanEval en la información disponible.
- Soporte multilingüe declarado mediante la etiqueta `multilingual`, sin listado de idiomas ni evaluación por idioma.
- Compatibilidad con endpoint inference de HuggingFace (`endpoints_compatible` en las etiquetas).
- Uso local offline: al ser GGUF, permite ejecución sin conexión en llama.cpp y derivados.
- Fine-tuning posterior: la model card enlaza notebooks de Unsloth para entrenamiento (incluido GRPO para modelos de razonamiento), aunque esos cuadernos están referidos a Phi-4 de 14B, no específicamente a la variante mini.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito (thinking mode) para esta variante.

## Casos de uso

- Atención al cliente automatizada en local: el modelo puede gestionar conversaciones multi-turno con un contexto nominal de 128K tokens, lo que permite adjuntar historiales largos o bases de conocimiento extensas sin trocear en exceso, manteniendo los datos dentro de la infraestructura propia.
- Generación y revisión de código en pipelines de integración continua: puede integrarse como componente de un flujo que genere parches o revise diffs, ejecutándose en un runner con GPU modesta gracias a sus ~3,8 B de parámetros en cuantizaciones de 4 bits.
- Asistente de tutoría y resolución de problemas matemáticos paso a paso: su entrenamiento sobre datos densos en razonamiento lo hace adecuado para explicaciones encadenadas, siempre que se validen las respuestas con herramientas externas de cálculo.
- Despliegue en portátiles y equipos de sobremesa sin acelerador dedicado: las cuantizaciones GGUF permiten inferencia en CPU con un consumo de memoria de unos pocos gigabytes, útil para herramientas internas de documentación o asistentes de escritorio.
- Resumen y extracción de información de documentos largos: contratos, informes o expedientes que caben en la ventana de 128K tokens pueden procesarse en una sola pasada, con salida estructurada.
- Agentes con llamada a funciones en entornos con recursos limitados: al ser un modelo pequeño, la latencia por paso se mantiene baja, lo que favorece bucles de razonamiento multi-paso con herramientas externas.
- Asistente multilingüe de bajo coste: para organizaciones que necesitan cubrir varios idiomas sin desplegar un modelo de decenas de miles de millones de parámetros, asumiendo que el rendimiento fuera del inglés no está documentado.
- Base para fine-tuning vertical con QLoRA: al estar disponible en GGUF y tener un modelo base en safetensors, puede servir como punto de partida para adaptaciones de dominio con recursos de una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio reproduce la plantilla de Unsloth y las notas de la familia Phi-4, pero no incluye tablas de MMLU, GSM8K, HumanEval ni métricas de perplejidad de las cuantizaciones. Tampoco se aportan comparativas frente a otras conversiones GGUF del mismo modelo.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin caché KV): en torno a 7,7 GB en FP16/BF16, ~4,1 GB en Q8_0, ~2,8 GB en Q5_K_M y ~2,4 GB en Q4_K_M. Estas cifras son estimaciones calculadas a partir del número de parámetros, no datos publicados por el autor.
- Caché KV: con 128K tokens de contexto la caché puede crecer varios gigabytes en precisión FP16, por lo que en contextos muy largos conviene reducir el contexto efectivo o usar cuantización de caché (por ejemplo, `--cache-type-k q8_0` en llama.cpp).
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB ejecutan sin problema las cuantizaciones de 4 a 8 bits con margen para contexto amplio. Tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) pueden con Q4 y contexto moderado.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S no aportan ventaja significativa por VRAM, pero sí mayor ancho de banda para lotes grandes; son útiles si se sirve el modelo base en BF16 con `vLLM` o `TGI`.
- CPU: las cuantizaciones Q4 permiten inferencia en CPU con unos 3-6 GB de RAM libre, con velocidades de decodificación del orden de pocos tokens por segundo según el procesador.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, koboldcpp, `llama-cpp-python` y text-generation-webui son las rutas naturales para GGUF. Para `vLLM` o `TGI` conviene usar el modelo base en safetensors, ya que el soporte de GGUF en esas pilas es limitado o experimental.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte de la información proporcionada y proceden de su documentación pública; se incluyen como referencia de categoría. El rendimiento comparado no está disponible porque no hay benchmarks publicados en la información consultada.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| TAKADOX/Phi-4-mini-instruct-GGUF (sobre Phi-4-mini) | 3,8 B | 128K | MIT | Sí, este repositorio |
| microsoft/Phi-4-mini-instruct (base) | 3,8 B | 128K | MIT | No (safetensors) |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 | Apache-2.0 | Sí, conversiones de terceros |
| Llama-3.2-3B-Instruct | ~3,2 B | 128K | Llama 3.2 Community License | Sí, conversiones de terceros |
| Gemma-2-2B-it | ~2,6 B | 8.192 | Gemma Terms of Use | Sí, conversiones de terceros |

## Limitaciones y advertencias

- Repositorio de terceros: no lo mantiene Microsoft ni Unsloth, sino el usuario TAKADOX. Con 0 descargas y 0 «likes», no hay validación de la comunidad sobre la fidelidad de la conversión.
- Falta de trazabilidad: no se documentan los niveles de cuantización incluidos, los hashes de los archivos ni métricas de degradación (perplejidad, evaluaciones) por nivel.
- Riesgo de alucinación: al ser un modelo de ~3,8 B, la generación de hechos inventados es frecuente en tareas factuales o de conocimiento abierto; requiere verificación externa en producción.
- Idioma: aunque se declara multilingüe, la familia Phi-4-mini está optimizada principalmente para inglés. No hay evaluación publicada de su rendimiento en castellano en la información disponible.
- Contexto: los 128K tokens son el máximo nominal. La calidad decae en contextos muy largos y la caché KV encarece el despliegue en memoria.
- Cuantización: los formatos de 4 bits y menores pueden degradar de forma apreciable el razonamiento matemático y la generación de código, que son precisamente las capacidades destacadas del modelo.
- Código personalizado: la etiqueta `custom_code` implica que cargar el modelo con transformers puede requerir `trust_remote_code=True`, con el riesgo de ejecución de código que ello conlleva.
- Model card heredada: buena parte del contenido del repositorio proviene de la plantilla de Unsloth y enlaza cuadernos referidos a Phi-4 de 14B, no a la variante mini; el repositorio no describe el proceso de cuantización propio.
- Licencia: MIT permite uso comercial sin restricciones adicionales, pero conviene verificar el fichero LICENSE del modelo base enlazado en la model card y conservar la atribución correspondiente.
- Fecha de creación del repositorio registrada como 2026-09-14, idéntica a la de actualización; no hay historial de mantenimiento posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TAKADOX/Phi-4-mini-instruct-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/resolve/main/LICENSE
- Colección de Unsloth con versiones de Phi-4 y correcciones: https://huggingface.co/collections/unsloth/phi-4-all-versions-677eecf93784e61afe762afa
- Blog de Unsloth sobre cuantizaciones dinámicas: https://unsloth.ai/blog/dynamic-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Documentación de Unsloth: https://docs.unsloth.ai/
- Cuaderno GRPO para Phi-4: https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Phi_4_(14B)-GRPO.ipynb
- Blog de Microsoft sobre Phi-4-mini: https://aka.ms/phi4-feb2025
- Informe técnico enlazado desde la model card: https://aka.ms/phi-4-multimodal/techreport
- Phi Cookbook: https://github.com/microsoft/PhiCookBook
- Portal de la familia Phi: https://azure.microsoft.com/en-us/products/phi
- Demo en Azure: https://aka.ms/phi-4-mini/azure
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/microsoft/phi-4-mini

Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo ni con inteligencia artificial (referencias a empresas alemanas del sector alimentario y a páginas de empleados). No se ha encontrado ningún enlace relevante adicional a través de la búsqueda.
