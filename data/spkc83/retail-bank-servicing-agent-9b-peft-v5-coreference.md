# spkc83/retail-bank-servicing-agent-9b-peft-v5-coreference

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) para el modelo base `spkc83/retail-bank-servicing-agent-9b`, un modelo de 9.000 millones de parámetros de la familia Granite, especializado en servicio bancario minorista. El adaptador, denominado `v5-coreference`, se centra en la resolución de correferencias dentro de conversaciones de atención al cliente, mejorando la capacidad del modelo para mantener referencias coherentes a entidades como cuentas, clientes o transacciones a lo largo de diálogos multi-turno.

Desarrollado por el autor `spkc83`, este adaptador es una continuación del entrenamiento de alineación SFT sobre el dataset `spkc83/retail-bank-servicing-alignment-sft`. Al tratarse de un adaptador LoRA, no incluye los pesos completos del modelo base, sino únicamente las actualizaciones de pesos entrenadas, lo que permite una integración ligera sobre el modelo base original. Su relevancia radica en ofrecer una solución específica para el sector bancario, donde la precisión en la gestión de referencias es crítica para la calidad del servicio automatizado.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el adaptador depende del modelo base, cuya licencia no se especifica en la información disponible. El repositorio tiene un tamaño de 0,2 GB, coherente con un adaptador de baja dimensionalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre modelo base Granite 9B) |
| Parametros totales | no disponible (el adaptador tiene 0,2 GB, el modelo base se estima en 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors para el adaptador) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que actualiza un subconjunto de los pesos del modelo base mediante matrices de bajo rango. El modelo base `spkc83/retail-bank-servicing-agent-9b` pertenece a la familia Granite de IBM, aunque no se detallan sus características arquitectónicas exactas (número de capas, tipo de atención, etc.) en la información proporcionada.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el dataset `spkc83/retail-bank-servicing-alignment-sft`, con un total de 1.250 pasos de optimizador. No se especifica si se utilizaron técnicas adicionales como RLHF o DPO. El adaptador se denomina `v5-coreference`, lo que sugiere que es una iteración posterior a una versión `v5-remediation` (mencionada como adaptador padre), enfocada específicamente en la resolución de correferencias.

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens procesados ni las innovaciones técnicas específicas del modelo base.

## Capacidades

- Generacion de texto conversacional orientado a servicio bancario minorista.
- Resolucion de correferencias: mantiene la coherencia de referencias a entidades (cuentas, clientes, transacciones) en dialogos multi-turno.
- Tool calling: el modelo base soporta llamada a herramientas, y el adaptador hereda esta capacidad.
- No se documentan capacidades adicionales como razonamiento avanzado, generacion de codigo o soporte multimodal.

## Casos de uso

- Atencion al cliente bancario automatizada: el adaptador permite gestionar conversaciones donde el cliente menciona "mi cuenta", "la transferencia anterior" o "el cargo de ayer", manteniendo la referencia correcta a lo largo del dialogo.
- Resolucion de consultas sobre movimientos: al integrarse con herramientas de consulta a bases de datos, el modelo puede extraer la entidad correcta (por ejemplo, una transaccion especifica) y responder con precision.
- Gestion de reclamaciones: en un flujo de reclamaciones, el modelo puede rastrear a que producto o servicio se refiere el cliente cuando usa pronombres o elisiones.
- Asistencia en operaciones bancarias: con tool calling, el modelo puede ejecutar acciones como transferencias o consultas de saldo, siempre que la referencia a la cuenta sea inequivoca.
- Soporte multilingue: aunque no se especifican idiomas, al ser un adaptador sobre un modelo base, podria heredar las capacidades multilingues del modelo Granite, si las tiene.
- Despliegue en entornos regulados: al ser un adaptador ligero, puede integrarse en sistemas existentes sin necesidad de reentrenar el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la evaluacion de entrenamiento se completo antes de la publicacion, pero los resultados no se incluyen en el repositorio.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, se carga sobre el modelo base. Un modelo de 9B en FP16 requiere aproximadamente 18 GB de VRAM; con cuantizacion (por ejemplo, 4-bit) puede reducirse a unos 6-8 GB.
- GPU recomendadas: para inferencia en produccion, una GPU con al menos 16 GB (como RTX 4090, A100 40GB) es adecuada. Para desarrollo, una GPU de 8-12 GB puede funcionar con cuantizacion.
- Opciones de despliegue: el adaptador se integra mediante la libreria PEFT sobre el modelo base. Se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque el repositorio solo proporciona safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo dominio (banca minorista con correferencias) ni sobre alternativas de la misma familia Granite. La comparativa no esta disponible.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador LoRA; no incluye los pesos del modelo base. Para su uso, es obligatorio cargar la revision exacta del modelo base especificada en el README (commit `1d56824995aa1adecfe20f62ca42fb1c0c443817`).
- El adaptador depende de un adaptador padre (`v5-remediation`) que debe cargarse previamente, lo que anade complejidad al despliegue.
- No se han publicado evaluaciones de sesgos, alucinaciones ni rendimiento en tareas generales. El modelo esta especializado en banca y puede no ser adecuado para otros dominios.
- La licencia del modelo base no se indica; aunque el adaptador es Apache 2.0, el uso del modelo base puede estar sujeto a otras condiciones.
- El dataset de entrenamiento no esta documentado en detalle, por lo que no se conocen posibles sesgos derivados de los datos.
- No se garantiza la estabilidad del modelo en produccion sin una evaluacion exhaustiva de los "frozen behavioral evaluation gates" mencionados en el README.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v5-coreference
- Modelo base (referencia): https://huggingface.co/spkc83/retail-bank-servicing-agent-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/spkc83/retail-bank-servicing-alignment-sft
- Adaptador padre: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v5-remediation
