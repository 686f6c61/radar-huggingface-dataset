# voidassassin/reax-generalist-r2

## Resumen

Reax-generalist-r2 es un modelo de lenguaje publicado por el usuario voidassassin en Hugging Face bajo licencia Apache 2.0. Con 31.273.088.876 parametros (aproximadamente 31,3 mil millones), se posiciona en la franja de modelos de talla media-grande, un rango en el que compiten propuestas como Gemma 2 27B, Qwen 2.5 32B o Mistral Large en su version reducida. El tag `gemma4` sugiere que el modelo deriva de la familia Gemma de Google, aunque no se especifica la relacion exacta con los pesos originales.

La informacion publica disponible es minima: el repositorio no incluye pipeline declarado, no lista idiomas soportados y no presenta resultados de benchmarks ni detalles de entrenamiento. El acceso esta restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargar los pesos. El tamano del repositorio, 125,1 GB, es coherente con pesos en formato safetensors en precision bf16/fp16 para un modelo de 31B parametros.

Su relevancia actual es limitada por la ausencia de documentacion tecnica y de evaluaciones publicadas, pero el hecho de que se distribuya con licencia Apache 2.0 y en safetensors lo convierte en un candidato potencial para experimentacion local o ajuste fino, siempre que el usuario asuma el coste de verificacion por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `gemma4` sugiere base Gemma) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 125,1 GB |
| Acceso | restringido (gated) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. El tag `gemma4` apunta a una posible derivacion de la familia Gemma de Google, lo que implicaria un transformer decoder-only con atencion multi-cabeza y posiblemente atencion local/global alternada, pero esta afirmacion no puede confirmarse con los datos disponibles. Tampoco se especifica si se trata de un modelo denso o de mezcla de expertos (MoE); el recuento de parametros totales (31,3B) es el unico dato objetivo.

Respecto al entrenamiento, no hay informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones como decodificacion especulativa o atencion lineal. Cualquier afirmacion al respecto seria especulativa y no debe tomarse como referencia.

## Capacidades

- Generacion de texto: capacidad esperable por el tipo de modelo, aunque no documentada oficialmente.
- Razonamiento y matematicas: no verificable sin benchmarks publicados.
- Generacion de codigo: no verificable.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ajuste fino: al distribuirse en safetensors con licencia Apache 2.0, es tecnicamente posible, aunque no hay guias publicadas.

## Casos de uso

- Experimentacion en investigacion: el modelo puede servir como base para estudiar el comportamiento de un transformer de 31B parametros con licencia permisiva, siempre que el equipo valide primero su calidad con sus propios conjuntos de evaluacion.
- Ajuste fino supervisado (SFT): al estar en safetensors y con licencia Apache 2.0, es viable aplicar LoRA o QLoRA sobre dominios concretos (legal, medico, financiero) y comparar contra la base Gemma si se confirma la derivacion.
- Despliegue interno en entornos controlados: con 125 GB de pesos en bf16, requiere hardware de gama alta (multi-GPU o nodos con 80 GB por GPU); encaja en infraestructura on-premise con acceso restringido, coherente con el caracter gated del repositorio.
- Generacion de texto asistida en prototipos: util para validar pipelines de inferencia (vLLM, TGI) antes de comprometerse con modelos mas documentados.
- Evaluacion comparativa de modelos de ~30B: sirve como punto de control adicional en estudios que comparen Gemma, Qwen y Mistral en la misma franja de parametros.
- Cuantizacion y optimizacion: el modelo es candidato para generar versiones GGUF/AWQ y medir la degradacion de calidad, aunque dichas versiones no estan publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 62,5 GB solo para pesos (31,3B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 80 GB.
- VRAM estimada en cuantizacion 8 bits: alrededor de 31-35 GB, viable en una A100 40 GB o H100 80 GB.
- VRAM estimada en cuantizacion 4 bits: alrededor de 16-20 GB, viable en RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que se genere la cuantizacion (no publicada).
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (con cuantizacion), 2x RTX 4090 (24 GB cada una) para bf16.
- Cabe en consumer GPU: solo con cuantizacion 4 bits en RTX 4090/3090; en bf16 no cabe en ninguna consumer actual.
- Opciones de despliegue: vLLM y TGI para bf16 en servidor; llama.cpp u Ollama tras generar GGUF; no hay artefactos oficiales para estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| reax-generalist-r2 | 31,3B | no disponible | Apache 2.0 | minima | gated |
| Gemma 2 27B | 27B | 8K | Gemma license | extensa | publica |
| Qwen 2.5 32B | 32,5B | 128K | Apache 2.0 | extensa | publica |
| Mistral Small 24B | 24B | 128K | Apache 2.0 | extensa | publica |

La comparativa se limita a parametros y licencia porque no hay datos de rendimiento del modelo evaluado. Frente a sus alternativas, reax-generalist-r2 carece de la documentacion, contexto declarado y evaluaciones que si publican Gemma, Qwen y Mistral, lo que dificulta una eleccion informada en produccion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de calidad en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Documentacion practicamente inexistente: sin model card detallada, sin idiomas declarados y sin pipeline asignado.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar la automatizacion de descargas en CI/CD.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado por el autor.
- Sesgos conocidos: no documentados; si deriva de Gemma, heredaria los sesgos de dicha familia, pero no puede confirmarse.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el usuario.
- Origen y procedencia: el tag `gemma4` no aclara si es un ajuste fino, una destilacion o un modelo entrenado desde cero; conviene verificar antes de usarlo en produccion.
- Sin cuantizaciones oficiales: el usuario debe generarlas y validar la degradacion de calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/voidassassin/reax-generalist-r2
- Perfil del autor: https://huggingface.co/voidassassin
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
