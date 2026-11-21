# timdedid/qwen3.8-cyber-uncensored

## Resumen

`timdedid/qwen3.8-cyber-uncensored` es una redistribucion comunitaria en formato GGUF del modelo Qwen3-1.7B de Alibaba, publicada por el usuario `timdedid` bajo licencia Apache-2.0. A pesar del sufijo `3.8` en el nombre, los metadatos del propio fichero GGUF identifican el modelo como Qwen3 1.7B (`general.name = "Qwen3 1.7B"`, `general.size_label = "1.7B"`); no se trata de un modelo de 8B. El autor lo etiqueta como "uncensored" y "abliterated", es decir, una variante sin el ajuste de seguridad habitual de Qwen3.

El problema que aborda es el de ofrecer una version local, ligera y sin filtros del modelo base, empaquetada en un unico fichero GGUF cuantizado en Q4_K_M de aproximadamente 1,36 GB, pensada para ejecutarse en `llama.cpp` y Ollama. El contexto declarado es de 40.960 tokens y la plantilla de chat va embebida en el GGUF.

Es relevante sobre todo por su tamano reducido (2.031.739.904 parametros segun los safetensors del modelo base), que permite inferencia en hardware de consumo, y por su caracter de redistribucion: el propio autor advierte que el fichero es byte a byte identico (SHA-256 `6037244a…`) a `timdedid/qwen3-cyber-UNCENSORED`, publicado de nuevo solo porque cambia el nombre del fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer, segun modelo base) |
| Parametros totales | 2.031.739.904 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado, ~1,36 GB) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (plantilla de chat embebida) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-1.7B, un transformer denso de la familia Qwen3 desarrollada por el equipo Qwen de Alibaba. La model card no aporta informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni sobre las modificaciones aplicadas por el autor de la redistribucion mas alla de la etiqueta "abliterated", que en la practica suele implicar la eliminacion o supresion de direcciones de rechazo en el espacio de activaciones. No se documenta la tecnica concreta empleada.

La unica innovacion tecnica verificable en la informacion disponible es el empaquetado: cuantizacion Q4_K_M en un unico fichero GGUF con plantilla de chat embebida, compatible con `llama.cpp` y Ollama. No se documentan tecnicas como decodificacion especulativa ni atencion lineal especificas de esta variante.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat integrada.
- Razonamiento y respuesta a instrucciones heredadas del modelo base Qwen3-1.7B.
- Generacion de codigo basica, limitada por el tamano de 1,7B parametros.
- Comportamiento sin filtros de seguridad ("uncensored"/"abliterated"), orientado a respuestas sin rechazo.
- Soporte de contexto largo de hasta 40.960 tokens a nivel de modelo (aunque la configuracion de ejemplo de Ollama limita `num_ctx` a 8192).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Experimentacion local en hardware modesto: el fichero Q4_K_M de ~1,36 GB se ejecuta en `llama.cpp` o Ollama en equipos de consumo, lo que permite probar un modelo Qwen3 sin infraestructura de GPU dedicada.
- Generacion de texto creativo sin restricciones: al estar abliterated, puede emplearse en tareas de escritura de ficcion o roleplay donde los filtros del modelo base resultan limitativos, siempre dentro de un uso legal.
- Pruebas de robustez y red teaming: util como referencia para estudiar como se comporta un modelo sin ajuste de seguridad y comparar con la version oficial de Qwen3-1.7B.
- Prototipado rapido de chatbots en ingles: la plantilla de chat embebida y el comando `llama-cli -cnv` permiten levantar una conversacion multi-turno en minutos.
- Educacion e investigacion sobre cuantizacion: sirve para medir el impacto de Q4_K_M frente al modelo original en tareas de generacion, dado su tamano manejable.
- Despliegue en entornos aislados o sin conexion: al ser un unico fichero GGUF, puede distribuirse y ejecutarse offline en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4-1,8 GB con Q4_K_M (fichero de 1,36 GB mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; tambien ejecutable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 Ti en adelante, RTX 3050, RTX 4060, etc.), asi como en CPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli -m ... -cnv`) y Ollama (`ollama run timdedid/qwen3-1.7b-cyber` o creando un Modelfile local).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| timdedid/qwen3.8-cyber-uncensored | 1,7B | 40.960 | Q4_K_M (GGUF) | Apache-2.0 | Redistribucion abliterated, sin benchmarks |
| Qwen/Qwen3-1.7B (base) | 1,7B | 40.960 (segun variante) | safetensors, cuantizaciones oficiales | Apache-2.0 | Modelo oficial con ajuste de seguridad |
| timdedid/qwen3-cyber-UNCENSORED | 1,7B | 40.960 | Q4_K_M (GGUF) | Apache-2.0 | Fichero byte a byte identico a este |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- El nombre `qwen3.8` es enganoso: el modelo es Qwen3 1.7B, no un modelo de 8B.
- Es una redistribucion duplicada: el fichero es identico a `timdedid/qwen3-cyber-UNCENSORED`; no aporta nada nuevo respecto a ese repositorio.
- Modelo sin ajuste de seguridad ("uncensored"/"abliterated"): puede producir contenido ofensivo, inexacto o danino; el autor recomienda uso responsable y solo para fines legales.
- Riesgo elevado de alucinacion por su tamano de 1,7B parametros.
- Soporte limitado a ingles segun la model card.
- Aunque el contexto del modelo es de 40.960 tokens, la configuracion de ejemplo de Ollama usa `num_ctx 8192`, lo que reduce el contexto efectivo si se sigue tal cual.
- No hay resultados de benchmarks ni evaluaciones publicadas; el rendimiento real no esta verificado.
- Licencia Apache-2.0 heredada de Qwen3, que permite uso comercial, pero el caracter abliterated puede implicar riesgos de cumplimiento en productos sujetos a politicas de contenido.
- No es un modelo oficial de Qwen/Alibaba; el autor lo declara como redistribucion no afiliada.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timdedid/qwen3.8-cyber-uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Redistribucion duplicada: https://huggingface.co/timdedid/qwen3-cyber-UNCENSORED
