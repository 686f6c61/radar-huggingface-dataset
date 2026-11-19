# tinyopsec/Qwen3.5-4B-heretic-v2-GGUF

## Resumen

`tinyopsec/Qwen3.5-4B-heretic-v2-GGUF` es un conjunto de cuantizaciones GGUF de un modelo de lenguaje de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) derivado de `Ttimms/Bible-Assistant-Qwen3.5-4B-v2`, que a su vez se apoya en la familia Qwen3.5. El autor de la cuantizacion es el usuario `tinyopsec`, mientras que el modelo base procede de `Ttimms`. El repositorio se publico el 17 de septiembre de 2026 y se actualizo el 1 de noviembre de 2026, acumulando 2.253 descargas en Hugging Face (2.749 segun OpenModelStats en el momento de la consulta).

El modelo esta orientado a generacion de texto conversacional en ingles, con un enfoque declarado de asistente biblico segun el nombre del modelo base. La relevancia practica de este repositorio no esta en la arquitectura (heredada del modelo original) sino en el empaquetado: ofrece diez variantes de cuantizacion entre 2 y 8 bits con tamanos desde aproximadamente 1,1 GB hasta 4,2 GB, lo que permite ejecutarlo desde dispositivos moviles y CPU hasta GPU de escritorio. El repo completo ocupa 36,4 GB.

La licencia es Apache 2.0 y los pesos se distribuyen exclusivamente en formato GGUF, lo que lo hace compatible de forma directa con llama.cpp, llama-cpp-python, LM Studio y Ollama. No se han publicado en la informacion disponible detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5, transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `Ttimms/Bible-Assistant-Qwen3.5-4B-v2` en los materiales proporcionados. Por el nombre y el tamano se infiere que se trata de un transformer de la familia Qwen3.5 con aproximadamente 4,2 mil millones de parametros, pero no se confirma en la documentacion disponible el tipo de atencion, el numero de capas, las dimensiones ocultas ni si emplea tecnicas como atencion lineal o decodificacion especulativa.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El nombre "Bible-Assistant" sugiere un ajuste fino orientado a consultas sobre contenido biblico, pero no se aportan detalles sobre el corpus utilizado. La unica informacion tecnica verificable de este repositorio es el proceso de cuantizacion: se ofrecen variantes K-quants (Q2_K a Q6_K) y Q8_0, generadas presumiblemente con las herramientas estandar de llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno segun la etiqueta `conversational`.
- Respuesta a preguntas sobre contenido biblico y temas relacionados, segun la orientacion declarada del modelo base.
- Compatibilidad con el pipeline `text-generation` de Hugging Face y con `endpoints_compatible`.
- Ejecucion local en CPU, GPU y dispositivos de borde gracias a las diez variantes de cuantizacion.
- Integracion con llama.cpp, llama-cpp-python, LM Studio y Ollama.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la etiqueta `language: en`.

## Casos de uso

- Asistente de estudio biblico local: el modelo puede responder preguntas sobre pasajes y temas doctrinales en un entorno totalmente offline, lo que resulta adecuado para usuarios que prefieren no enviar consultas a servicios en la nube. La variante Q4_K_M (aproximadamente 2,1 GB) es el punto de partida recomendado por el autor.
- Despliegue en equipos sin GPU dedicada: la variante Q2_K ocupa aproximadamente 1,1 GB y requiere unos 1,5 GB de VRAM o memoria RAM, por lo que puede ejecutarse en CPU en portatiles modestos.
- Aplicaciones moviles y de borde: las variantes Q3_K_S (aproximadamente 1,4 GB) y Q3_K_M (aproximadamente 1,5 GB) estan pensadas explicitamente para dispositivos moviles y edge, lo que permite integrar el modelo en apps de consulta sin conexion.
- Prototipado rapido con Ollama: el autor proporciona el comando `ollama pull hf.co/tinyopsec/bible-assistant-qwen35-4b-GGUF:q4_k_m`, lo que permite tener un endpoint de chat funcional en minutos para validar ideas de producto.
- Generacion de contenido devocional: redaccion de resumenes, reflexiones o material de estudio a partir de fragmentos de texto, con la ventaja de que el modelo se ejecuta localmente y el coste marginal por token es cero.
- Educacion y catequesis asistida: un docente puede desplegar el modelo en un aula con hardware consumer (por ejemplo, una GPU de gama media con 3-4 GB de VRAM para Q5_K_M o Q6_K) y ofrecer un asistente de consulta controlado y sin dependencia de API externas.
- Investigacion sobre cuantizacion: el repositorio sirve como caso de estudio para medir la degradacion de calidad entre Q8_0 y Q2_K en un modelo de 4 B, ya que ofrece la misma familia en diez niveles de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun el autor: Q8_0 aproximadamente 4,5 GB; Q6_K aproximadamente 3,5 GB; Q5_K_M aproximadamente 3,0 GB; Q4_K_M aproximadamente 2,5 GB; Q3_K_M aproximadamente 2,0 GB; Q2_K aproximadamente 1,5 GB.
- GPU recomendadas: cualquier GPU de escritorio con 4-6 GB de VRAM para las variantes de 5-8 bits (por ejemplo, RTX 3060, RTX 4060, RTX 4090); GPU de portatil con 2-3 GB para Q3; CPU para Q2_K.
- Cabe en GPU consumer: si, en todas las variantes. Incluso Q8_0 (aproximadamente 4,5 GB) entra en tarjetas de 6 GB o mas.
- Opciones de despliegue: llama.cpp (`./main`), llama-cpp-python, LM Studio y Ollama (comando documentado por el autor). Tambien es compatible con endpoints de Hugging Face por la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un modelo de 4 B, se espera una velocidad alta en GPU consumer, pero no se aportan cifras verificables.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo para establecer una comparativa cuantitativa fiable. A continuacion se comparan unicamente caracteristicas objetivas verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Qwen3.5-4B-heretic-v2-GGUF | 4,2 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones de un ajuste biblico sobre Qwen3.5 |
| Ttimms/Bible-Assistant-Qwen3.5-4B-v2 | 4,2 B | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva este repositorio |
| Familia Qwen3.5-4B original | 4,2 B (aproximado) | no disponible | no disponible | safetensors, GGUF | Referencia de arquitectura; no se dispone de ficha comparativa en la informacion |

No se han identificado en la busqueda web modelos alternativos de la misma categoria con datos verificables para comparar rendimiento.

## Limitaciones y advertencias

- El modelo esta etiquetado unicamente para ingles (`language: en`); no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Al ser un ajuste fino orientado a contenido biblico, puede presentar sesgos teologicos o denominacionales derivados de los datos de entrenamiento del modelo base, no documentados en la informacion disponible.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni mecanismos de citacion verificada, por lo que las respuestas sobre pasajes concretos deben contrastarse con el texto original.
- No se documenta la longitud de contexto, lo que impide planificar conversaciones largas o tareas de recuperacion aumentada con fragmentos extensos.
- No hay evidencia publicada de soporte de tool calling ni de razonamiento multi-paso, por lo que no es recomendable para pipelines de agentes sin validacion previa.
- Aunque la licencia declarada es Apache 2.0, el modelo base no expone su licencia en la informacion disponible; conviene verificar el repositorio original antes de un uso comercial.
- El repositorio no incluye resultados de benchmarks ni evaluaciones de calidad por cuantizacion; la eleccion entre Q2_K y Q8_0 debe hacerse por prueba empirica.
- El nombre del repositorio incluye "heretic", lo que sugiere un ajuste orientado a reducir rechazos o restricciones de seguridad; no se documenta el proceso ni sus implicaciones, por lo que debe evaluarse el comportamiento en produccion antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/tinyopsec/Qwen3.5-4B-heretic-v2-GGUF
- Modelo base: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v2
- Free2AITools: https://free2aitools.com/model/tinyopsec/qwen3.5-4b-heretic-v2-gguf
- OpenModelStats: https://openmodelstats.com/models/tinyopsec/qwen3.5-4b-heretic-v2-gguf
- Pirate Face: https://pirateface.co/tinyopsec/Qwen3.5-4B-heretic-v2-GGUF
- Socket (Hugging Face Hub package): https://socket.dev/huggingface/package/tinyopsec/qwen3.5-4b-heretic-v2-gguf
