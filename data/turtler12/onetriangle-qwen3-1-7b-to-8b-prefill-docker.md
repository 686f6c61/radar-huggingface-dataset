# turtler12/onetriangle-qwen3-1.7b-to-8b-prefill-docker

## Resumen

OneTriangle Qwen3 1.7B → 8B mapped prefill es un paquete de despliegue Docker publicado por el usuario turtler12 que permite ejecutar Qwen3-8B con un prefill generado por Qwen3-1.7B a traves de una API compatible con OpenAI. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia que combina dos modelos de la familia Qwen3 (un modelo pequeno de 1.7B y uno grande de 8B) mediante un mapper verificado criptograficamente, empaquetado con Docker Compose, un lanzador automatizado y una API con autenticacion por bearer token.

El problema que aborda es el coste computacional del prefill en modelos de 8B: al delegar la fase de prefill en un modelo de 1.7B y reutilizar su cache KV mapeada hacia el modelo grande, se pretende reducir el trabajo de atencion inicial. El repositorio incluye verificacion de integridad (hash SHA-256 del mapper, revisiones fijas de ambos modelos) y rechaza arrancar si algo no coincide.

Es relevante como ejemplo practico de tecnicas de comparticion de cache KV entre modelos de distinto tamano, aunque no es un modelo en si mismo ni publica pesos propios: es un contenedor de despliegue. La licencia es MIT y el pipeline no esta declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con prefill mapeado entre modelos; el paquete es un runtime Docker, no un modelo unico |
| Parametros totales | 1.7B (modelo de prefill) y 8B (modelo objetivo); el artefacto no define un unico total |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens incluyendo la completion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el paquete descarga los modelos pinned desde Hugging Face; el mapper es un artefacto verificado por SHA-256) |

## Arquitectura y entrenamiento

El artefacto no entrena ningun modelo. Combina dos checkpoints oficiales de Qwen3: `Qwen/Qwen3-1.7B` en la revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` como fuente de prefill y `Qwen/Qwen3-8B` en la revision `b968826d9c46dd6066d109eabc6255188de91218` como modelo objetivo. Un mapper con SHA-256 `9cb42f6e83a5804c8e33966d579ffcd41b9ad4ab82df7f1d8efc5a5179e4fab6` transforma la cache KV del modelo pequeno para su uso por el modelo grande. El runtime valida hash del mapper, metadatos, identidades y revisiones antes de arrancar.

La innovacion tecnica reside en el pipeline de prefill mapeado y en el empaquetado reproducible: lanzador `start.sh`, Docker Compose v2, NVIDIA Container Toolkit, generacion automatica de API key, espera de readiness y smoke test. La descarga inicial es de aproximadamente 25 GB y el arranque tipico de 10 a 30 minutos. No se documentan datos de entrenamiento, RLHF, DPO ni composicion del dataset, porque no se entrena nada nuevo.

## Capacidades

- Generacion de texto mediante API compatible con OpenAI chat-completions, incluido streaming SSE.
- Razonamiento y conocimiento general heredados de Qwen3-8B (no se detallan capacidades especificas en la informacion disponible).
- Soporte de tool calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidad especial del paquete: prefill acelerado mediante cache KV mapeada desde Qwen3-1.7B.
- Autenticacion por bearer token generado aleatoriamente y guardado en `.env`.
- Endpoint de salud (`/health`) y logs via Docker Compose.

## Casos de uso

- Despliegue local de Qwen3-8B con API compatible con OpenAI: util para prototipar aplicaciones que ya usan el SDK de OpenAI sin cambiar el codigo, apuntando el cliente a `http://localhost:8000/v1`.
- Investigacion sobre comparticion de cache KV entre modelos de distinto tamano: el paquete permite reproducir el experimento de prefill mapeado 1.7B → 8B con verificacion de integridad.
- Evaluacion comparativa de latencia de prefill: permite medir el efecto de sustituir el prefill nativo de 8B por el mapeado desde 1.7B en un entorno controlado.
- Entornos aislados o de laboratorio: el Compose sirve HTTP plano, adecuado para localhost o red de confianza, con token bearer para control de acceso basico.
- Pruebas de integracion de pipelines LLM: el smoke test y el endpoint `/health` facilitan la incorporacion a CI o a scripts de validacion.
- Reproducibilidad de despliegues: las revisiones fijas y el hash del mapper permiten reconstruir exactamente el mismo entorno en distintas maquinas con GPU NVIDIA de al menos 40 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: minimo 40 GB en una GPU NVIDIA (requisito explicito del autor).
- GPUs recomendadas: no se especifican modelos concretos; por capacidad, encajan A100 40/80 GB, H100 y GPUs profesionales con 40 GB o mas. No cabe en RTX 4090 (24 GB) ni en GPUs consumer de gama alta con menos de 40 GB.
- Sistema: Linux x86_64 con Docker, Docker Compose v2 y NVIDIA Container Toolkit.
- Almacenamiento: aproximadamente 25 GB para la descarga inicial de modelos y mapper.
- Despliegue: Docker Compose con servicios `runtime` y `api`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneTriangle Qwen3 1.7B → 8B prefill Docker | 1.7B + 8B (dos checkpoints) | 32.768 tokens | Runtime de prefill mapeado sobre Qwen3-8B | MIT | Hugging Face, 0 descargas |
| Qwen3-8B (oficial) | 8B | no disponible en esta ficha | Modelo base de generacion | no disponible en esta ficha | Hugging Face |
| Qwen3-1.7B (oficial) | 1.7B | no disponible en esta ficha | Modelo base de generacion | no disponible en esta ficha | Hugging Face |

La comparativa se limita a los checkpoints referenciados por el propio paquete; no se dispone de datos de rendimiento para contrastar con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: es un paquete de despliegue; cualquier evaluacion de calidad debe hacerse sobre Qwen3-8B subyacente.
- Requiere al menos 40 GB de VRAM, lo que excluye GPUs consumer habituales.
- El Compose sirve HTTP plano; sin TLS ni controles de red adicionales no debe exponerse fuera de localhost o red de confianza.
- La API key se guarda en `.env`; el autor advierte de no publicarlo.
- El runtime rechaza arrancar si el hash del mapper, los metadatos o las revisiones no coinciden, lo que puede bloquear despliegues si cambian los artefactos upstream.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas especificas del paquete; hereda las de Qwen3-8B, no detalladas aqui.
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado ni datos de benchmarks.
- La fecha de creacion indicada (2026-11-11) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/turtler12/onetriangle-qwen3-1.7b-to-8b-prefill-docker
- Modelo fuente Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo objetivo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Documentacion adicional referenciada en la model card: `CUSTOMER_GUIDE.md` y `VALIDATION_REPORT.md` dentro del repositorio
- Ejemplo de cliente: `examples/python_openai.py` dentro del repositorio
