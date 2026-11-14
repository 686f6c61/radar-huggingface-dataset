# Teriks/Kandinsky-5.0-T2V-Pro-sft-5s-GGUF

## Resumen

Kandinsky 5.0 T2V Pro sft 5s GGUF es una distribucion cuantizada del transformer del modelo de generacion de video texto-a-video Kandinsky 5.0 T2V Pro sft 5s, publicado originalmente por kandinskylab en formato Diffusers. El autor de esta ficha, Teriks, ha convertido los pesos del transformer a formato GGUF en dos niveles de cuantizacion (Q4_K_S y Q8_0) para facilitar su despliegue en entornos con memoria limitada.

El modelo resuelve el problema de generar clips de video de 5 segundos a partir de una descripcion textual, manteniendo coherencia temporal y fidelidad al prompt. Con 19.311.325.248 parametros totales en el transformer (aproximadamente 19,3 mil millones), es un modelo grande que en su forma original en safetensors resulta costoso de cargar; las cuantizaciones GGUF reducen sustancialmente el peso en disco y en memoria.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de video de gran tamano en hardware mas modesto, manteniendo la compatibilidad con el repositorio Diffusers original: los nombres de tensor coinciden con el checkpoint de referencia y basta con cargar el repositorio Diffusers como modelo padre e indicar el archivo GGUF como transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de difusion para texto-a-video, derivado del checkpoint Diffusers de Kandinsky 5.0) |
| Parametros totales | 19.311.325.248 (transformer) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (dos archivos: `kandinsky5Pro_t2v_sft_5s-Q4_K_S.gguf` y `kandinsky5Pro_t2v_sft_5s-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se trata de un transformer de difusion para generacion de video a partir de texto, integrado en el ecosistema Diffusers. El checkpoint base `kandinskylab/Kandinsky-5.0-T2V-Pro-sft-5s-Diffusers` corresponde a una variante afinada (sft) para clips de 5 segundos, y esta publicacion unicamente contiene la conversion a GGUF del transformer, no del resto de componentes del pipeline (VAE, codificadores de texto, etc.), que deben obtenerse del repositorio original.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del entrenamiento. La unica innovacion documentada en esta ficha es la propia cuantizacion GGUF, que preserva los nombres de tensor del checkpoint Diffusers para permitir una sustitucion directa del transformer.

## Capacidades

- Generacion de video texto-a-video: produce clips de 5 segundos a partir de una descripcion textual.
- Compatibilidad con el pipeline Diffusers de Kandinsky 5.0: el transformer cuantizado se carga como componente del pipeline original.
- Dos niveles de cuantizacion para equilibrar calidad y consumo de memoria (Q4_K_S y Q8_0).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado rapido de video generativo: cargar el transformer Q4_K_S dentro del pipeline Diffusers para iterar sobre prompts sin necesidad de disponer de la VRAM que exige el checkpoint completo en safetensors.
- Generacion de clips cortos para redes sociales: producir videos de 5 segundos a partir de descripciones textuales para pruebas de concepto de campanas o storyboards.
- Entornos con GPU de gama alta consumer: usar la cuantizacion Q4_K_S para reducir el peso del transformer y poder ejecutar el pipeline en estaciones de trabajo con menos memoria que las requeridas por el modelo original.
- Evaluacion comparativa de cuantizaciones: comparar la calidad visual y la coherencia temporal entre Q4_K_S y Q8_0 sobre el mismo conjunto de prompts para decidir el compromiso adecuado en produccion.
- Investigacion en difusion de video: emplear el transformer cuantizado como base para experimentos de muestreo, schedulers o tecnicas de control sobre un modelo de 19,3 mil millones de parametros.
- Integracion en pipelines de generacion por lotes: desplegar el modelo en servidores con memoria ajustada para generar multiples clips de 5 segundos de forma secuencial, aprovechando el menor footprint del GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 31,4 GB; el transformer Q8_0 se aproxima al peso de los parametros en 8 bits (unos 19 GB) y Q4_K_S a la mitad aproximadamente (unos 10-11 GB), a lo que hay que sumar la memoria de los demas componentes del pipeline Diffusers (VAE y codificadores de texto).
- GPU recomendadas: no disponible. Por el tamano del transformer, se requieren GPU profesionales (A100, H100) o GPU consumer de gama alta con suficiente VRAM; el modelo completo en precision original no cabe en GPU consumer.
- Cabe en GPU consumer: Q4_K_S podria caber en GPU con 24 GB de VRAM (por ejemplo, RTX 4090) si el resto del pipeline se gestiona con cuidado; Q8_0 requiere mas memoria y probablemente no quepa en 24 GB junto con el resto de componentes. No confirmado por el autor.
- Opciones de despliegue: el autor indica cargar el repositorio Diffusers como modelo padre y pasar el archivo GGUF como transformer; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a pipelines de difusion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-T2V-Pro-sft-5s-GGUF | 19.311.325.248 | no disponible | GGUF (Q4_K_S, Q8_0) | MIT | Hugging Face |
| kandinskylab/Kandinsky-5.0-T2V-Pro-sft-5s-Diffusers | 19.311.325.248 | no disponible | safetensors (Diffusers) | no disponible en la informacion | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo se distribuye el transformer cuantizado: es imprescindible descargar el repositorio Diffusers original para obtener el VAE, los codificadores de texto y la configuracion del pipeline.
- La cuantizacion Q4_K_S puede degradar la calidad visual y la coherencia temporal respecto al checkpoint original en precision completa; no hay evaluaciones publicadas que cuantifiquen esa perdida.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir contenido incoherente o no fiel al prompt; no hay datos especificos publicados.
- Duracion fija de 5 segundos por clip; no se documenta soporte para otras duraciones en esta variante.
- Idiomas soportados no disponibles; no se puede confirmar el rendimiento en castellano.
- Licencia MIT declarada en esta publicacion, pero conviene verificar la licencia del modelo base original antes de uso comercial.
- Sin descargas ni likes en el momento de la consulta: no hay validacion de la comunidad sobre la calidad de estas cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/Kandinsky-5.0-T2V-Pro-sft-5s-GGUF
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Pro-sft-5s-Diffusers
