# trpk75/publishing-dslm-gguf

## Resumen

`trpk75/publishing-dslm-gguf` es un modelo derivado de Qwen2.5-1.5B-Instruct, ajustado finamente y convertido a formato GGUF por el usuario `trpk75` mediante la herramienta Unsloth. El repositorio contiene una unica cuantizacion publicada, `Qwen2.5-1.5B-Instruct.Q4_K_M.gguf`, junto con un Modelfile de Ollama para facilitar el despliegue local. El numero de parametros declarado en safetensors (1.543.714.304) coincide con el tamano de la familia Qwen2.5-1.5B, lo que confirma que el modelo base es un transformer denso de 1,5 mil millones de parametros.

El interes practico del repositorio es acotado: se trata de una publicacion de artefacto (un GGUF listo para `llama.cpp`) mas que de un modelo con documentacion tecnica propia. La model card no detalla el dataset de ajuste fino, los hiperparametros, la licencia ni los idiomas soportados, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Por tanto, cualquier evaluacion de calidad debe hacerse por inferencia a partir del modelo base Qwen2.5-1.5B-Instruct, no de datos propios del autor.

Su relevancia es la de un ejemplo de flujo de trabajo: ajuste fino con Unsloth (que acelera el entrenamiento y reduce el consumo de memoria) seguido de exportacion a GGUF y empaquetado para Ollama. Resulta util como plantilla reproducible para quien quiera publicar un modelo pequeno en local, pero no como modelo de referencia para produccion sin una evaluacion previa del ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 es multilingue, con especial enfasis en chino e ingles) |
| Licencia | no disponible en el repositorio; el modelo base Qwen2.5 se distribuye bajo Apache 2.0 |
| Formato de pesos | GGUF (`Qwen2.5-1.5B-Instruct.Q4_K_M.gguf`), mas Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención de tipo causal, normalizacion RMSNorm, activacion SwiGLU y sesgos QKV (una particularidad de la familia Qwen2 respecto a Llama). Con 1,54 B de parametros y embeddings atados, esta pensado para inferencia en CPU y GPU de gama baja. El autor indica que el ajuste fino y la conversion a GGUF se realizaron con Unsloth, lo que implica tecnicas de entrenamiento con kernels optimizados y, probablemente, LoRA o QLoRA, aunque la model card no especifica el metodo, el dataset, el numero de pasos ni si hubo alineamiento adicional (RLHF/DPO) mas alla del que ya incorpora el modelo base.

No se documenta ninguna innovacion arquitectonica propia. El unico detalle operativo relevante es el uso de `--jinja` en los comandos de ejemplo, que activa el motor de plantillas de chat de `llama.cpp` para aplicar correctamente el formato de conversacion del tokenizador Qwen2.5. La model card menciona tambien `llama-mtmd-cli` para modelos multimodales, pero el archivo publicado es de texto; esa linea parece heredada de la plantilla generica de Unsloth y no debe interpretarse como soporte de vision.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de instrucciones de Qwen2.5.
- Razonamiento basico y resolucion de problemas sencillos, limitado por el tamano de 1,5 B.
- Generacion de codigo en lenguajes populares, con calidad moderada y propensa a errores en tareas complejas.
- Aritmetica y matematicas elementales; el modelo base no destaca en razonamiento matematico avanzado.
- Soporte de tool calling / function calling segun el formato de Qwen2.5-Instruct, aunque la model card no lo verifica para este ajuste concreto.
- Capacidades multilingues del modelo base (chino, ingles y otros idiomas con menor cobertura), sin confirmacion especifica del autor.
- No hay evidencia de modo de razonamiento explicito (thinking), vision, audio ni otras modalidades en los archivos publicados.

## Casos de uso

- Prototipado local de asistentes conversacionales: el GGUF Q4_K_M ocupa aproximadamente 1 GB y se ejecuta en CPU con `llama-cli`, lo que permite validar prompts y flujos de chat sin infraestructura GPU.
- Pruebas de integracion con Ollama: el Modelfile incluido permite levantar el modelo con `ollama run` en minutos, util para entornos de desarrollo y demos internas.
- Clasificacion y extraccion de informacion en textos cortos: con 1,5 B de parametros el modelo es adecuado para tareas de etiquetado, resumen de parrafos o extraccion de entidades cuando la precision no es critica.
- Generacion de codigo asistida en el editor: puede completar funciones sencillas y explicar fragmentos, integrado via API compatible con OpenAI que expone `llama.cpp` o Ollama.
- Evaluacion comparativa de ajustes finos: sirve como referencia para medir si un ajuste con Unsloth mejora o degrada el comportamiento del base en un dominio concreto.
- Educacion y experimentacion: por su tamano reducido, es un candidato para estudiar tecnicas de cuantizacion, plantillas Jinja y despliegue en dispositivos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, comparaciones con el modelo base ni datos de perdida durante el ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2-1,5 GB con la cuantizacion Q4_K_M, incluyendo el contexto y los buffers de `llama.cpp`.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores; tambien funciona en A100/H100, aunque el modelo esta muy infrautilizado en ese hardware.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama mediante el Modelfile incluido, y cualquier runtime compatible con GGUF (LM Studio, Jan, KoboldCpp). No se publican pesos safetensors ni se menciona soporte de vLLM o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| trpk75/publishing-dslm-gguf | 1,54 B | no disponible (base: 32.768) | no disponible | GGUF Q4_K_M | Ajuste fino sin documentar |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Alternativa pequena con entrenamiento documentado |

La comparacion directa con el modelo base es la mas informativa: cualquier diferencia de calidad respecto a Qwen2.5-1.5B-Instruct se debe al ajuste fino del autor, que no esta documentado ni evaluado.

## Limitaciones y advertencias

- La model card no documenta el dataset de ajuste fino, los hiperparametros ni el metodo de entrenamiento, lo que impide auditar el comportamiento del modelo.
- Riesgo de alucinacion elevado en un modelo de 1,5 B, especialmente en tareas de razonamiento, matematicas y codigo complejo.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no se puede evaluar la presencia de sesgos de genero, raza, idioma o dominio.
- Licencia no especificada en el repositorio: antes de cualquier uso comercial debe confirmarse la licencia del modelo base (Qwen2.5 es Apache 2.0) y la del ajuste, que el autor no declara.
- Idiomas no declarados: el rendimiento fuera de ingles y chino puede degradarse de forma significativa.
- Contexto no confirmado: aunque el base soporta 32.768 tokens, la cuantizacion Q4_K_M y el ajuste fino pueden alterar el comportamiento en contextos largos; conviene validarlo empiricamente.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- La mencion a `llama-mtmd-cli` en la model card es enganosa para este artefacto: el archivo publicado es de texto, no multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trpk75/publishing-dslm-gguf
- Unsloth (herramienta de ajuste fino y conversion): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
