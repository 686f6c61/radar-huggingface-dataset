# TesseractLens-AI/Tesseract-Qwen2.5-1.5B-Spatial

## Resumen

Tesseract-Qwen2.5-1.5B-Spatial es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, desarrollado por TesseractLens-AI. Se trata de un modelo de generacion de texto de 1.500 millones de parametros, derivado de la version cuantizada en 4 bits de Unsloth del modelo instructivo de Alibaba Qwen, y entrenado con la libreria Unsloth y TRL. El sufijo "Spatial" sugiere una especializacion en tareas de razonamiento espacial o geometrico, aunque la model card no documenta explicitamente el conjunto de datos ni el objetivo del ajuste.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con un contexto nativo de 32.768 tokens en el modelo base, aunque la model card no confirma que se haya preservado esa ventana tras el ajuste. Al ser un derivado de Qwen2.5-1.5B-Instruct, su relevancia practica radica en la posibilidad de desplegarlo en hardware de consumo y en entornos con recursos limitados, manteniendo capacidades de instruccion, tool calling y generacion de codigo propias de la familia Qwen2.5.

La ficha publica es extremadamente escasa: no incluye informacion sobre el dataset de entrenamiento, hiperparametros, benchmarks ni limitaciones. El repositorio ocupa 0,1 GB, lo que es coherente con pesos en precision reducida derivados de la base cuantizada en 4 bits. La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion tecnica obliga a tratar el modelo con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (aproximado, heredado de Qwen2.5-1.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmado tras el ajuste |
| Tipos de cuantizacion | Base entrenada sobre bnb-4bit; pesos publicados en safetensors (precision no especificada) |
| Idiomas soportados | Ingles (declarado); el modelo base Qwen2.5 soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1.500 millones de parametros y atencion causal estandar. El ajuste fino se realizo sobre `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`, una version del modelo instructivo de Qwen2.5 cuantizada en 4 bits mediante bitsandbytes y optimizada por Unsloth. El entrenamiento empleo Unsloth y TRL, segun la model card, con una velocidad declarada de "2x mas rapido" respecto a un pipeline convencional, aunque no se especifican hiperparametros, numero de pasos, tamano del dataset ni composicion del mismo.

No hay informacion sobre si se aplico RLHF, DPO, SFT supervisado o una combinacion, ni sobre el corpus utilizado para la especializacion "Spatial". Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El nombre sugiere un enfasis en razonamiento espacial, pero la model card no aporta evidencia que lo respalde.

## Capacidades

- Generacion de texto e instrucciones genericas, heredadas de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a preguntas.
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad limitada por el tamano).
- Soporte de tool calling y function calling, presumiblemente heredado del modelo base, aunque no verificado tras el ajuste.
- Capacidades multilingues del modelo base (Qwen2.5 soporta varios idiomas), aunque la model card solo declara ingles.
- Posible especializacion en tareas espaciales o geometricas, segun el sufijo del nombre, sin documentacion que lo confirme.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo cabe en GPU de consumo y permite iterar sobre prompts y flujos multi-turno sin infraestructura dedicada.
- Clasificacion y extraccion de informacion en ingles: con 1.500 millones de parametros puede procesar lotes de documentos cortos en entornos con VRAM limitada.
- Generacion de codigo asistida en entornos locales: util para autocompletado o generacion de fragmentos en IDE con hardware modesto, aunque con menor calidad que modelos mayores.
- Pruebas de concepto de razonamiento espacial: si el ajuste esta orientado a tareas geometricas, sirve para evaluar pipelines de vision-lenguaje o descripcion de escenas, siempre que se valide empiricamente.
- Fine-tuning posterior o destilacion: al ser pequeno y con licencia Apache 2.0, es adecuado como base para nuevos ajustes en dominios especificos.
- Despliegue en edge o entornos sin GPU dedicada: con cuantizacion adicional (GGUF) puede ejecutarse en CPU o en GPUs integradas para tareas de baja latencia.
- Educacion e investigacion: modelo ligero para experimentar con tecnicas de alineacion, evaluacion o interpretabilidad sin grandes costes de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 (1.500 millones de parametros), unos 1-2 GB en cuantizacion de 4 bits.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A10, L4; cualquier GPU con al menos 4 GB de VRAM para FP16.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; en cuantizacion 4-bit puede ejecutarse incluso en GPUs integradas.
- Opciones de despliegue: transformers, vLLM, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), TGI (tag `text-generation-inference` presente).
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tesseract-Qwen2.5-1.5B-Spatial | 1.500 M | 32.768 (base, no confirmado) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 | Apache 2.0 | Hugging Face |
| Llama 3.2-1B-Instruct | 1.200 M | 128.000 | Llama 3.2 Community License | Hugging Face |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 | Apache 2.0 | Hugging Face |

No hay datos de rendimiento comparativo disponibles para este ajuste.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan dataset, hiperparametros, evaluacion ni limitaciones.
- Riesgo de alucinacion elevado por el tamano reducido del modelo y la falta de validacion publicada.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La especializacion "Spatial" no esta documentada; no asumir capacidades espaciales sin evaluacion empirica.
- El ajuste se realizo sobre una base cuantizada en 4 bits, lo que puede introducir degradacion respecto al modelo original en FP16.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y documentacion traslada al integrador toda la responsabilidad de validacion.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.
- No apto para produccion sin una evaluacion previa exhaustiva en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/TesseractLens-AI/Tesseract-Qwen2.5-1.5B-Spatial
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Qwen2.5-1.5B-Instruct (original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
