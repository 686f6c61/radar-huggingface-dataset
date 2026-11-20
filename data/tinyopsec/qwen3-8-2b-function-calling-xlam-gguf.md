# tinyopsec/Qwen3.8-2B-Function-Calling-xLAM-GGUF

## Resumen

Qwen3.8-2B-Function-Calling-xLAM-GGUF es la distribucion en formato GGUF del modelo `ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth`, un ajuste fino de la familia Qwen3.8 orientado especificamente a function calling y uso de herramientas. Lo publica el usuario `tinyopsec` como un unico repositorio con once cuantizaciones listas para llama.cpp, lo que elimina la friccion de convertir pesos desde safetensors y permite ejecutar un modelo de 1.942.653.248 parametros en hardware de consumo.

El modelo parte de una arquitectura hibrida SSM + Attention (etiquetada como Qwen3.5 en la model card) con una longitud de contexto declarada de 262.144 tokens, un tamano poco habitual en la categoria de 2B. El ajuste fino se realizo mediante el pipeline xLAM, un conjunto de datos y metodologia orientados a generar trazas de llamadas a funciones de alta calidad, lo que lo hace adecuado para agentes que necesitan emitir JSON estructurado de forma fiable.

Su relevancia actual radica en la combinacion de tres factores: licencia Apache 2.0 sin restricciones de uso comercial, contexto muy largo para su tamano y despliegue trivial en CPU o GPU modesta mediante llama.cpp. Es una opcion practica para prototipar agentes locales, enrutadores de herramientas y asistentes con acceso a APIs sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (hibrida SSM + Attention) |
| Parametros totales | 1.942.653.248 (aproximadamente 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado desde safetensors via `convert_hf_to_gguf.py`) |

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen3.5 con un diseno hibrido que combina capas de espacio de estados (SSM) con atencion clasica. Este esquema reduce el coste computacional y de memoria en contextos largos frente a un transformer puro, lo que explica que un modelo de 2B pueda sostener una ventana de 262.144 tokens. El modelo base es Qwen3.8-2B, sobre el que se aplico un ajuste fino supervisado mediante el pipeline xLAM, centrado en la generacion de llamadas a funciones y trazas de uso de herramientas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card del repositorio GGUF no documenta hiperparametros de entrenamiento ni detalles del proceso de ajuste; unicamente describe la conversion a GGUF. Las cuantizaciones se generaron con `convert_hf_to_gguf.py` para el F16 intermedio y `llama-quantize` para los K-quants, con calibracion imatrix en el caso de IQ4_XS.

## Capacidades

- Generacion de texto conversacional con plantilla de chat Qwen3 (`<|im_start|>` / `<|im_end|>`).
- Function calling y tool use: el ajuste con xLAM entrena al modelo para emitir llamadas estructuradas a funciones.
- Razonamiento multi-paso orientado a agentes, con encadenamiento de llamadas a herramientas.
- Contexto largo de 262.144 tokens, util para historiales de conversacion extensos o documentos grandes.
- Compatibilidad con endpoints OpenAI-style a traves de `llama-server`.
- Capacidades multilingues limitadas: la model card solo declara ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Agentes locales de automatizacion: el modelo emite llamadas a funciones en JSON que un orquestador puede ejecutar contra APIs internas, con la ventaja de correr integramente en local y sin coste por token.
- Enrutador de herramientas en pipelines RAG: dado un conjunto de funciones disponibles, el modelo selecciona la adecuada y rellena los argumentos, aprovechando el contexto largo para incluir descripciones extensas de herramientas.
- Asistente de terminal y CLI: integrado con `llama-cli` o `llama-server`, puede gestionar tareas de shell, consultas a bases de datos o peticiones HTTP mediante tool calling.
- Prototipado rapido en portatiles: con Q4_K_M (1,31 GB) se ejecuta en CPU con 8 GB de RAM, lo que permite iterar sobre disenos de agentes sin GPU.
- Backend de bajo coste para atencion al cliente: conversaciones multi-turno con contexto largo y llamadas a sistemas de ticketing o CRM mediante funciones registradas.
- Extraccion estructurada de datos: el modelo puede transformar texto libre en objetos JSON validos siguiendo un esquema de funcion, util para ingestas ETL.
- Evaluacion comparativa de tecnicas de tool calling: al ser pequeno y de licencia permisiva, sirve como baseline reproducible en experimentos de investigacion sobre agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q8_0 2,08 GB; Q6_K 1,61 GB; Q5_K_M 1,45 GB; Q4_K_M 1,31 GB; IQ4_XS 1,23 GB; Q3_K_M 1,13 GB; Q2_K 990 MB.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) ejecuta Q4_K_M con margen para el contexto.
- En CPU funciona sin GPU: con 8 GB de RAM es suficiente para Q4_K_M; se recomienda Q8_0 solo si hay 4 GB o mas de VRAM libre.
- GPU de datacenter (A100, H100) no son necesarias; solo tendrian sentido para servir muchas peticiones concurrentes con `llama-server`.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-2B-Function-Calling-xLAM (este) | 2B | 262.144 | Function calling / tool use | Apache 2.0 | GGUF |
| Qwen3.8-2B (base) | 2B | 262.144 | Proposito general | no disponible en la informacion | safetensors |
| ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth | 2B | 262.144 | Function calling / tool use | Apache 2.0 (heredada) | safetensors |

La comparativa con alternativas de otros autores (por ejemplo, modelos de 1B a 3B especializados en tool calling) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento comparado.

## Limitaciones y advertencias

- Idioma: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Riesgo de alucinacion en argumentos de funciones: al ser un modelo de 2B, puede inventar parametros o nombres de herramientas no registrados; conviene validar el JSON contra un esquema antes de ejecutarlo.
- Contexto declarado de 262.144 tokens: no hay evidencia publicada de calidad en el extremo de la ventana; el rendimiento suele degradarse en contextos muy largos.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de Qwen3.8 hereda los del modelo base, no auditados en esta ficha.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero se recomienda conservar el aviso de licencia y verificar la licencia del modelo base original.
- Produccion: el repositorio tiene 1 like y 1.304 descargas, con mantenimiento por un unico autor; no hay garantias de soporte ni actualizaciones.
- No se documentan modos de razonamiento explicito ni capacidades multimodales; no debe asumirse que las tenga.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Qwen3.8-2B-Function-Calling-xLAM-GGUF
- Modelo base (Unsloth): https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales.
