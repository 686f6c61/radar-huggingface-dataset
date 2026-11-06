# Zayaan/zils-d3mini-intern

## Resumen

ZILS d3-mini Intern es una redistribución de los pesos del modelo internlm/Intern-Decision-4B, publicada por el usuario Zayaan bajo la etiqueta "Zils d3-mini soup-body". No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: el autor indica explícitamente que los pesos son los de Intern-Decision-4B en la revisión `38c9dafbbef52dd04bae943c0c6ac918419adfd5`, sin modificar, únicamente reorganizados en un layout de nombres con prefijos `language_model.*` y `visual.*`.

El modelo base, Intern-Decision-4B, es un modelo de decisión de 4B parámetros de la familia InternLM, orientado a tareas de razonamiento y toma de decisiones. La publicación se enmarca en la subred 127 de Bittensor (Zils), un ecosistema de modelos distribuidos donde los pesos se redistribuyen con un esquema de nombres concreto para su integración en la infraestructura de la subred.

La relevancia de esta ficha es limitada desde el punto de vista técnico: no aporta mejoras de rendimiento, datos de entrenamiento nuevos ni benchmarks propios. Su interés es principalmente operativo, para quienes necesitan los pesos de Intern-Decision-4B en el formato de nombres que espera la subred Zils.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de internlm/Intern-Decision-4B; no se detalla en la informacion proporcionada) |
| Parametros totales | 4.539.265.536 (~4,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 9,1 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la informacion proporcionada. El modelo base es internlm/Intern-Decision-4B, pero esta ficha no incluye su model card ni detalles sobre tipo de transformer, atencion, capas, dimensiones ocultas o vocabulario. La presencia de un prefijo `visual.*` en el layout de nombres sugiere que el modelo base incorpora un componente visual, aunque no se confirma ni se detalla su naturaleza.

Respecto al entrenamiento, no hay datos disponibles sobre numero de tokens, composicion del dataset, fases de RLHF/DPO o tecnicas de alineacion. La publicacion ZILS no ha realizado entrenamiento adicional: el autor declara que los pesos son los originales, sin cambios, y que todo el credito corresponde a los autores de Intern-Decision-4B. La unica transformacion es el renombrado de parametros al esquema "soup-body" de Zils (`language_model.*`, `visual.*`).

## Capacidades

- No se han documentado capacidades especificas en la informacion proporcionada.
- Por herencia del modelo base Intern-Decision-4B, se presume orientacion a tareas de decision y razonamiento, pero no se detalla en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible; el prefijo `visual.*` sugiere un posible componente visual, sin confirmar.

## Casos de uso

- Integracion en la subred 127 de Bittensor (Zils): el modelo se publica precisamente en el layout `language_model.*` / `visual.*` que espera la infraestructura de la subred, por lo que su uso principal es servir como cuerpo (body) dentro de los pipelines de esa red.
- Redistribucion y espejo de pesos: util para quienes necesitan una copia de Intern-Decision-4B en el formato Zils con licencia apache-2.0 y trazabilidad de la revision de origen.
- Evaluacion comparativa del modelo base: al ser pesos identicos a Intern-Decision-4B, sirve para reproducir resultados del modelo original en un entorno con el esquema de nombres de Zils.
- Experimentacion con modelos de decision de ~4B: adecuado para prototipos de clasificacion o seleccion de acciones donde se quiera partir de un modelo de decision preentrenado, sujeto a validar sus capacidades reales.
- Fine-tuning posterior: al estar en safetensors y con licencia apache-2.0, puede usarse como punto de partida para ajustes propios, aunque conviene partir del repositorio original de InternLM para evitar dependencias del layout Zils.
- Docencia y auditoria de formatos: caso practico para estudiar como se reorganizan pesos entre esquemas de nombres sin alterar los tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,1 GB solo para pesos (4,54B parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica, 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: ~4,5-5 GB de pesos; a 4 bits: ~2,3-2,8 GB de pesos, mas overhead.
- GPU recomendadas: no disponibles de forma especifica; por tamano, una RTX 4090 (24 GB) o A100/H100 permiten FP16 con holgura. Una RTX 3090/4080 (16 GB) seria suficiente para FP16 con contexto limitado.
- Cabe en GPU de consumo: si, en GPUs con 12 GB o mas en cuantizacion, y en 16-24 GB en FP16.
- Opciones de despliegue: no se documentan en la informacion proporcionada. Al ser safetensors, es compatible con frameworks estandar (transformers, vLLM, TGI) siempre que se adapte el mapeo de nombres del layout Zils. No se confirma soporte de llama.cpp/Ollama por ausencia de GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ZILS d3-mini Intern (esta ficha) | ~4,54B | no disponible | apache-2.0 | Pesos de Intern-Decision-4B en layout Zils, sin entrenamiento adicional |
| internlm/Intern-Decision-4B | ~4B (segun nombre) | no disponible | no disponible en esta ficha | Modelo base original; fuente de los pesos |
| Alternativas de ~4B (p. ej. Qwen, Llama 3.2 3B) | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos a Intern-Decision-4B; no debe esperarse ninguna mejora de rendimiento respecto al original.
- Ausencia total de documentacion: no hay model card tecnica, benchmarks, idiomas ni contexto declarados en esta publicacion.
- Trazabilidad limitada: el autor indica la revision concreta del modelo base (`38c9daf...`), pero no se aportan hashes ni verificacion de integridad de los tensores.
- Layout no estandar: los prefijos `language_model.*` y `visual.*` pueden requerir adaptaciones en el codigo de carga si se usan frameworks que esperan el esquema original de InternLM.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; deben asumirse los del modelo base, que tampoco se detallan aqui.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del repositorio original de Intern-Decision-4B y de los datos de entrenamiento subyacentes.
- Publicacion con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Uso en produccion desaconsejado sin evaluacion previa: no hay evidencia publicada de calidad, latencia ni estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zayaan/zils-d3mini-intern
- Modelo base: https://huggingface.co/internlm/Intern-Decision-4B
- Revision del modelo base citada: `38c9dafbbef52dd04bae943c0c6ac918419adfd5`
- Subred Bittensor 127 (Zils): no disponible enlace oficial en la informacion proporcionada.
