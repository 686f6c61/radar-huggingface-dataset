# wesjos/Llama-3.2-3B-Thinking-SFT-GGUF

## Resumen

Llama-3.2-3B-Thinking-SFT-GGUF es una distribucion en formato GGUF de un ajuste fino supervisado (SFT) sobre Llama 3.2 3B, el modelo denso de Meta de la familia Llama 3.2 publicada en septiembre de 2024. El autor del repositorio, wesjos, ha aplicado un entrenamiento supervisado orientado a razonamiento ("Thinking") y ha exportado los pesos a GGUF mediante Unsloth, con el objetivo de facilitar la ejecucion local en llama.cpp y entornos compatibles. El modelo base tiene 3.212.749.888 parametros (aproximadamente 3,2 mil millones), lo que lo situa en el segmento de modelos pequenos aptos para hardware de consumo.

La relevancia de esta ficha es acotada y conviene ser honesto: se trata de un repositorio con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin resultados de benchmarks publicados. No hay informacion sobre el dataset de SFT, el numero de tokens de entrenamiento ni la composicion de la mezcla de datos. Por tanto, esta ficha describe lo que se puede verificar (arquitectura heredada del base, formato de pesos, tamano, metodo de conversion) y marca explicitamente como "no disponible" todo lo que no consta.

El interes practico reside en que permite probar localmente un Llama 3.2 3B con un ajuste orientado a cadenas de razonamiento en una unica cuantizacion Q4_K_M, sin necesidad de GPU dedicada en muchos casos. Es un artefacto experimental, no un modelo de referencia para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Llama 3.2 3B; no se documenta desviacion en el ajuste) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Llama 3.2 3B soporta 128K tokens, pero el ajuste no lo declara) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `Llama-3.2-3B-Thinking-SFT.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 2,0 GB); el modelo base se distribuye en safetensors, pero este repo solo publica GGUF |
| Tokenizador | heredado de Llama 3.2 (BOS ajustado para compatibilidad con GGUF, segun el autor) |
| Herramienta de conversion | Unsloth |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y tokenizador BPE de Llama 3, disenado por Meta para despliegue en el borde. El repositorio no documenta cambios estructurales respecto al base; el trabajo del autor consiste en un ajuste fino supervisado (SFT) etiquetado como "Thinking", presumiblemente orientado a producir trazas de razonamiento antes de la respuesta final, y en la posterior conversion a GGUF.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la precision del entrenamiento (fp16/bf16/QLoRA) ni hiperparametros. El autor solo indica que el entrenamiento se realizo con Unsloth y que fue "2x mas rapido", lo que sugiere uso de kernels optimizados y posiblemente LoRA o QLoRA, pero no se confirma. Tampoco se detalla si se aplico decodificacion especulativa, atencion lineal u otra innovacion; a efectos verificables, el modelo se comporta como un Llama 3.2 3B estandar con un SFT adicional. El unico detalle tecnico concreto es el ajuste del comportamiento del token BOS para compatibilidad con llama.cpp.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational` del repo.
- Razonamiento en modo "thinking": el nombre del ajuste sugiere emision de cadenas de pensamiento antes de la respuesta, aunque no se documenta el formato exacto de las etiquetas.
- Ejecucion local via llama.cpp (`llama-cli -hf ... --jinja`) y compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`).
- Soporte de plantillas Jinja para el chat template (`--jinja`).
- Capacidades multilingues: no disponibles (el base Llama 3.2 cubre 8 idiomas oficialmente, pero este ajuste no lo declara).
- Tool calling / function calling: no documentado en este repositorio.
- Capacidades de agente multi-paso: no documentadas.
- Vision: no aplica; el autor menciona `llama-mtmd-cli` como ejemplo generico, pero este repositorio no incluye proyector multimodal.
- Codigo y matematicas: heredadas del base, sin evaluacion publicada en este ajuste.

## Casos de uso

- Pruebas de razonamiento local en portatil: cargar el Q4_K_M con llama.cpp y evaluar cadenas de pensamiento en tareas de logica o aritmetica sin GPU dedicada, gracias a los ~2 GB del archivo.
- Prototipado de asistentes conversacionales offline: usar `llama-cli` o `llama-server` con la plantilla Jinja para validar flujos de chat multi-turno en entornos sin conectividad.
- Evaluacion comparativa de ajustes SFT: emplear este modelo como punto de partida para medir si el SFT "Thinking" mejora sobre el Llama 3.2 3B original en tareas de razonamiento, con la cautela de que no hay benchmarks publicados.
- Integracion en pipelines de CI para pruebas de humo de llama.cpp: al ser un GGUF pequeno, sirve para validar versiones de llama.cpp, plantillas Jinja y compatibilidad de endpoints antes de desplegar modelos mayores.
- Educacion e investigacion: estudiar como se comporta un SFT de razonamiento en un modelo de 3B, inspeccionando las trazas generadas y comparandolas con el base.
- Despliegue en dispositivos de borde con poca memoria: el Q4_K_M ocupa aproximadamente 2 GB, lo que permite ejecucion en mini-PC, Raspberry Pi 5 con 8 GB o moviles de gama alta mediante bindings de llama.cpp.
- Base para nuevos ajustes: al estar en GGUF no es ideal para reentrenar, pero sirve como referencia de comportamiento para comparar futuros fine-tunes sobre Llama 3.2 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M (pesos ~2 GB mas cache KV y overhead de llama.cpp). Con contexto largo la cache KV crece de forma proporcional.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien A100/H100 para despliegues por lotes, aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Thinking-SFT-GGUF (este) | 3,21 B | no disponible | GGUF Q4_K_M | no disponible | SFT comunitario, sin benchmarks |
| Llama 3.2 3B Instruct (Meta) | 3,21 B | 128K | safetensors, GGUF oficial | Llama 3.2 Community License | Base oficial, con evals publicadas |
| Qwen2.5 3B Instruct | 3,09 B | 32K (128K en variantes) | safetensors, GGUF | Apache 2.0 | Alternativa con licencia permisiva |
| Phi-3.5-mini Instruct | 3,8 B | 128K | safetensors, GGUF | MIT | Buen rendimiento en razonamiento para su tamano |

La comparativa es orientativa: este repositorio no publica metricas, por lo que no se puede afirmar que supere o iguale a las alternativas. La principal diferencia practica es la licencia no declarada, que impide asumir uso comercial sin consultar al autor.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar el repo antes de desplegar en produccion.
- Sin benchmarks: no hay evidencia publicada de que el SFT "Thinking" mejore al base; el nombre del ajuste no garantiza calidad.
- Riesgo de alucinacion: inherente a modelos de 3B, especialmente en tareas de conocimiento factual y matematicas complejas.
- Contexto no documentado: no se confirma la ventana efectiva tras el ajuste; el base soporta 128K, pero el SFT podria haberla reducido.
- Idiomas no declarados: no se garantiza cobertura multilingue mas alla del ingles.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin issues ni validacion de la comunidad.
- Unica cuantizacion: solo Q4_K_M; no hay fp16, Q8_0 ni otras variantes para comparar calidad.
- Ajuste de BOS: el autor modifico el comportamiento del token BOS, lo que puede provocar diferencias sutiles frente al base en algunas plantillas.
- No apto como referencia de produccion sin evaluacion propia previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wesjos/Llama-3.2-3B-Thinking-SFT-GGUF
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Modelo base Llama 3.2 3B (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B
- Anuncio de Llama 3.2 (blog de Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
