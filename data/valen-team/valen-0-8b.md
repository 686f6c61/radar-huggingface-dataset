# Valen-Team/Valen-0.8B

## Resumen

Valen-0.8B es un modelo multimodal de decisión desarrollado por Valen-Team, afinado a partir del modelo base Qwen/Qwen3.5-0.8B. A diferencia de los modelos generativos convencionais, Valen está disenado para emitir decisiones estructuradas y probabilidades sobre entradas multimodales (texto, imagen y vídeo), orientadas a tareas de clasificación, enrutamiento y verificación. El problema que resuelve es el de convertir tareas de decisión operativa (por ejemplo, clasificar mensajes de clientes o comprobar si una imagen cumple requisitos) en salidas tipadas y probabilísticas, en lugar de texto libre.

El modelo cuenta con 854.305.641 parámetros totales (aproximadamente 0,8B) y se distribuye en formato safetensors bajo licencia Apache 2.0. Está etiquetado para los idiomas inglés y chino, y su pipeline en Hugging Face es image-text-to-text. Emplea la librería transformers con código personalizado (trust_remote_code) y una API de decisión propia (predict) que acepta preguntas tipadas como predicados o "noul".

Su relevancia actual radica en que ofrece una alternativa ligera y abierta para pipelines de decisión automatizada con soporte de vídeo e imagen, con código de entrenamiento y dataset publicados, lo que permite reutilizar y afinar el modelo para tareas propias. La model card indica que una nueva versión, Valen-Decision-1.5-0.8B, ya está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-0.8B, transformer multimodal image-text-to-text) |
| Parametros totales | 854.305.641 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, Q8_0 (GGUF), ONNX q8-mlp; Q4/Q5 descartados por no superar los controles de calidad |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (nativo); ONNX; GGUF (runtime personalizado de Valen) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo deriva de Qwen/Qwen3.5-0.8B, un modelo multimodal de tipo image-text-to-text, y de que ha sido sometido a full-finetuning (ajuste completo) sobre esa base. La model card menciona etiquetas como "shared-state" y "structured-output", asi como una API de decisión propia (predict) que acepta preguntas tipadas (predicate, noul) y devuelve respuestas con probabilidad asociada. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset en la informacion proporcionada.

Se publica el codigo de entrenamiento en GitHub (Valen-Team/Valen) y el dataset Valen-Training-General-100k en Hugging Face, lo que permite reproducir o ampliar el ajuste. No se documentan en la informacion disponible detalles sobre RLHF, DPO, decodificacion especulativa ni tecnicas de attention lineal. El modelo se carga mediante transformers con trust_remote_code=True y atencion SDPA.

## Capacidades

- Decision estructurada y probabilistica sobre entradas de texto, imagen y video, mediante una API predict con preguntas tipadas (predicate, noul) que devuelve probabilidades por respuesta.
- Clasificacion de mensajes de clientes y enrutamiento de tickets (ticket routing).
- Verificacion de imagenes contra requisitos definidos (product-image screening).
- Identificacion de acciones y etiquetado en videos (video tagging).
- Soporte de salida tipada y estructurada (image-text-to-typed-output, structured-output).
- Capacidades conversacionales y de decision en juegos (por ejemplo, Sokoban, segun las demos del repositorio).
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con dos formatos de API de decision: SystemOne (Jev) y Decisions (OpenAI).
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica mensajes de clientes y devuelve probabilidades que permiten decidir que tickets se enrutan automaticamente y cuales requieren revision humana, tal como se describe en el cookbook de ticket routing.
- Verificacion de imagenes de producto: se usa para comprobar si una imagen cumple requisitos definidos (product-image screening), filtrando contenido que no cumple las politicas antes de publicarlo.
- Etiquetado de video: identifica acciones en videos y asigna etiquetas, util para catalogar contenido audiovisual de forma automatizada.
- Moderacion de contenido multimodal: aplica predicados tipados sobre texto e imagenes para decidir si una publicacion cumple las normas de la plataforma.
- Decision en entornos de juego: las demos del repositorio muestran su uso en Sokoban, lo que sugiere aplicaciones en agentes que toman decisiones paso a paso sobre estados visuales.
- Automatizacion de flujos con umbrales de confianza: al devolver probabilidades, permite fijar politicas de incertidumbre y derivar casos dudosos a revision humana.
- Integracion en servicios C++/Linux: mediante GGUF con el runtime personalizado de Valen, o via SDK ONNX para aplicaciones Python/JavaScript offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona controles de calidad (quality gates) que descartaron las cuantizaciones GGUF Q4/Q5 y recomienda solo F32/Q8_0, pero no aporta cifras de MMLU, HumanEval, GSM8K ni metricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 854.305.641 parametros, en F32 el peso de los pesos ronda los 3,4 GB y en Q8_0 aproximadamente 0,9 GB, sin contar overhead de runtime.
- GPU recomendadas: la model card indica que el ejemplo Python se ejecuta localmente en una GPU NVIDIA; no se listan modelos concretos (A100, H100, RTX 4090).
- Cabe en GPU de consumo: no confirmado en la informacion disponible, aunque el tamano de parametros sugiere que podria caber en GPUs consumer; no se ofrece garantia.
- Opciones de despliegue: transformers (nativo, con trust_remote_code), ONNX Runtime (SDK Python/JavaScript), GGUF con runtime personalizado de Valen para servicios C++ en Linux CPU, y SGLang/vLLM para despliegue en GPU. No se reclama soporte en llama.cpp/Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-0.8B | 854.305.641 | no disponible | Decision multimodal estructurada (texto/imagen/video) | apache-2.0 | Hugging Face, ONNX, GGUF, API gratuita |
| Valen-Decision-1.5-0.8B | no disponible | no disponible | Version sucesora del mismo equipo | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | Modelo multimodal image-text-to-text generativo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado.
- Cuantizacion: las variantes GGUF Q4/Q5 no superaron los controles de calidad y solo se recomiendan F32 y Q8_0.
- Video en GGUF: el paquete prebuilt GGUF 0.1.0 no compila soporte directo de video; las pruebas historicas de video con compilacion desde fuente no qualifican el paquete prebuilt.
- Soporte de runtime: no se reclama compatibilidad con llama.cpp u Ollama oficiales sin modificar.
- Rendimiento: no se prometen metricas de latencia o throughput no medidas; las validaciones de calidad se limitan al ambito documentado (por ejemplo, P1 verifica imagenes fijas solo con 0.8B Q8_0).
- Alucinacion y sesgos: no se documentan en la informacion disponible; al ser un modelo de decision probabilistica, conviene aplicar politicas de incertidumbre y revision humana en casos dudosos.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia del modelo base Qwen/Qwen3.5-0.8B.
- Versionado: existe una version sucesora (Valen-Decision-1.5-0.8B); para nuevos proyectos conviene evaluar esa version.

## Enlaces

- Hugging Face: https://huggingface.co/Valen-Team/Valen-0.8B
- Version sucesora: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Documentacion de inicio rapido: https://valen-team.github.io/docs/valen/quickstart/
- Guia de seleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Validacion: https://valen-team.github.io/cookbook/validation/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
