# zils-ai/z3-lite-mac-body

## Resumen

z3-lite-mac-body es un fine-tune ligero del modelo vllm-sr/d3-lite, cuyo padre arquitectonico es Qwen3.5-0.8B, desarrollado por zils-ai. Se trata de un ajuste realizado sobre 256 decisiones publicas de tipo "bootstrap", entrenado en Apple silicon mediante MPS el 24 de octubre de 2026 y reempaquetado como cuerpo ("body") dentro de un pool de tipo soup denominado Zils d3-lite. El checkpoint incluye los pesos completos de lenguaje y vision; la estructura adicional (chassis, prompt y readout) la aporta el pool.

El modelo cuenta con 852.985.920 parametros en formato safetensors, lo que lo situa en la franja sub-1B, adecuada para inferencia en hardware modesto. Su relevancia es limitada y muy especifica: no es un modelo de proposito general, sino un componente de un sistema mayor (el pool Zils) pensado para integrarse en un pipeline propietario. La model card es extremadamente escueta y no documenta arquitectura, datos de entrenamiento ni evaluaciones.

La licencia Apache 2.0 permite uso comercial y modificacion, pero la ausencia de informacion sobre idiomas, contexto y rendimiento hace que cualquier despliegue en produccion requiera validacion propia. El modelo se publico el 3 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen3.5-0.8B segun la model card) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La model card indica que el modelo deriva de vllm-sr/d3-lite, cuyo padre es Qwen3.5-0.8B, y que conserva los pesos completos de lenguaje y vision del checkpoint. El ajuste se realizo sobre 256 decisiones publicas de bootstrap, entrenadas en Apple silicon con MPS el 24 de octubre de 2026. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

El empaquetado como "soup-body" implica que el modelo no funciona de forma autonoma: el chassis, el prompt y el readout los proporciona el pool Zils. El repositorio incluye codigo personalizado (tag custom_code) y un archivo zils-owner.json que identifica la hotkey que realizo el commit en cadena. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: heredada del checkpoint Qwen3.5-0.8B, sin documentacion especifica de rendimiento.
- Vision: la model card afirma que los pesos de vision estan incluidos en el checkpoint completo.
- Integracion en pool: el modelo esta disenado para operar dentro del pool Zils, con chassis, prompt y readout externos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Componente de un pipeline Zils: el modelo se usaria como "body" dentro del pool d3-lite, aportando los pesos de lenguaje y vision mientras el pool gestiona prompt y readout. Es su proposito declarado.
- Experimentacion con fine-tunes ligeros sobre Qwen3.5-0.8B: sirve como referencia de un ajuste de pocas muestras (256 decisiones) para estudiar el efecto del entrenamiento en MPS sobre un modelo sub-1B.
- Prototipado en hardware Apple silicon: al haberse entrenado en MPS, es un candidato natural para pruebas en Mac con memoria unificada, aunque no se documentan requisitos.
- Investigacion sobre modelos "soup" y empaquetado modular: permite analizar como se separan cuerpo, chassis y readout en un mismo sistema.
- Evaluacion de licencias Apache 2.0 en modelos derivados: util para estudiar la trazabilidad de un fine-tune sobre un modelo base con licencia permisiva.
- Docencia y divulgacion: como ejemplo de modelo de 853M parametros con vision y licencia abierta, aunque la falta de documentacion limita su uso didactico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, un modelo de 853M parametros en fp16 ocupa aproximadamente 1,7 GB de pesos, y en cuantizacion de 8 bits alrededor de 0,9 GB, pero el autor no confirma estos calculos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por tamano, pero no confirmada por el autor.
- Opciones de despliegue: el tag custom_code sugiere que requiere codigo propio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| z3-lite-mac-body | 852.985.920 | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Qwen3.5-0.8B (padre declarado) | ~0,8B | no disponible | no disponible | no disponible |
| vllm-sr/d3-lite (base directa) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Documentacion minima: la model card no detalla arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad sin pruebas propias.
- Dependencia del pool: el modelo no es autonomo; requiere chassis, prompt y readout del pool Zils, lo que limita su uso fuera de ese ecosistema.
- Riesgo de alucinacion: no evaluado por el autor; en un modelo de 853M parametros es esperable un riesgo elevado en tareas abiertas.
- Sesgos: no documentados; el entrenamiento sobre 256 decisiones de bootstrap no permite caracterizar sesgos.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la trazabilidad del modelo base y del pool debe verificarse por separado.
- Madurez: publicado en noviembre de 2026 con 0 descargas y 0 likes; sin evidencia de uso en produccion.
- Codigo personalizado: el tag custom_code implica que la carga del modelo puede requerir dependencias especificas no documentadas.

## Enlaces

- HuggingFace: https://huggingface.co/zils-ai/z3-lite-mac-body
- Modelo base: https://huggingface.co/vllm-sr/d3-lite (referencia declarada en la model card)
