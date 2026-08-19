# unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF

## Resumen

Qwen3-Coder-30B-A3B-Instruct es un modelo de lenguaje causal especializado en tareas de codificacion, desarrollado por el equipo Qwen y cuantizado a formato GGUF por Unsloth para su ejecucion local eficiente. Este modelo pertenece a la familia Qwen3-Coder, disenada para abordar problemas de generacion de codigo, razonamiento agente y comprension de repositorios a gran escala. Su relevancia actual radica en que combina un rendimiento destacado en tareas de codificacion agente con una arquitectura de mezcla de expertos (MoE) que activa solo 3.300 millones de parametros por token, lo que permite ejecutarlo en hardware de consumo con cuantizaciones adecuadas.

La arquitectura del modelo es un transformer MoE con 30.500 millones de parametros totales y 3.300 millones activos, distribuidos en 48 capas, 128 expertos (8 activos por token) y atencion GQA con 32 cabezas de consulta y 4 de clave-valor. Soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1 millon mediante la tecnica Yarn. Una caracteristica notable es que este modelo solo opera en modo no-thinking, es decir, no genera bloques de razonamiento explicito, lo que simplifica su uso en produccion.

La version GGUF publicada por Unsloth incluye multiples cuantizaciones (desde Q2_K hasta Q8_0, incluyendo sus "Unsloth Dynamic Quants") y ha acumulado mas de 7,9 millones de descargas, lo que refleja su adopcion en la comunidad. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con GQA |
| Parametros totales | 30.500 millones (30.5B) |
| Parametros activos | 3.300 millones (3.3B) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M con Yarn |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y Unsloth Dynamic Quants (no se especifica lista completa) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer causal con mezcla de expertos (MoE). Tiene 48 capas, 128 expertos en total y 8 expertos activos por token, lo que reduce el coste computacional por inferencia. La atencion utiliza GQA (Grouped Query Attention) con 32 cabezas de consulta y 4 de clave-valor, optimizando el uso de memoria en contextos largos. El entrenamiento se realizo en dos etapas: pretraining y post-training, aunque no se especifican los datos exactos ni el numero de tokens utilizados. El modelo fue disenado para soportar exclusivamente el modo no-thinking, por lo que no genera secuencias de razonamiento interno, lo que reduce la latencia en comparacion con modelos que incluyen modo thinking.

Una innovacion destacable es su soporte nativo para contextos de 256K tokens, ampliable a 1M mediante la tecnica Yarn, lo que permite procesar repositorios completos de codigo. Ademas, incorpora un formato de llamada a funciones especificamente disenado para tareas de codificacion agente, compatible con plataformas como Qwen Code y CLINE.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con especial enfasis en tareas de codificacion agente y uso de herramientas.
- Soporte de function calling y tool calling, con un formato de llamada a funciones optimizado para agentes de codificacion.
- Capacidad para razonamiento multi-paso en tareas de codificacion, aunque sin modo thinking explicito.
- Comprension de repositorios a gran escala gracias a su contexto nativo de 256K tokens, ampliable a 1M.
- Integracion con entornos de desarrollo como CLINE y Qwen Code para automatizacion de tareas de programacion.
- Capacidades multilingues no confirmadas en la informacion disponible; se recomienda verificar con pruebas especificas.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletar codigo, generar funciones y explicar fragmentos, aprovechando su contexto largo para mantener el estado del archivo completo.
- Agente autonomo de codificacion: gracias a su soporte de function calling, puede utilizarse con herramientas como CLINE para ejecutar tareas como crear archivos, ejecutar tests y corregir errores de forma autonoma.
- Generacion de codigo en pipelines CI/CD: puede integrarse en flujos de integracion continua para generar pruebas unitarias, documentacion o parches a partir de descripciones de issues, reduciendo el trabajo manual de los desarrolladores.
- Revision de codigo y analisis de repositorios: su contexto de 256K tokens permite procesar repositorios completos para detectar vulnerabilidades, code smells o inconsistencias, y sugerir mejoras.
- Refactorizacion de codigo legacy: puede analizar grandes bases de codigo antiguas y proponer refactorizaciones seguras, manteniendo el contexto de multiples archivos.
- Documentacion automatica: puede generar documentacion tecnica (comentarios, README, guias de API) a partir del codigo fuente, con comprension del proyecto completo.
- Chat tecnico de soporte: puede responder preguntas sobre APIs, frameworks o errores de compilacion, utilizando su conocimiento de codigo y su capacidad de generar ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor menciona un "rendimiento significativo" en tareas de codificacion agente y navegacion, pero no se proporcionan cifras concretas. Se recomienda consultar el blog oficial de Qwen (enlazado abajo) para obtener datos de evaluacion detallados.

## Requisitos de hardware

- No se proporcionan requisitos oficiales en la informacion disponible. Como referencia orientativa, un modelo MoE de 30.5B parametros totales con cuantizacion Q4_K_M ocupa aproximadamente 18-20 GB en disco, por lo que puede ejecutarse en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090, A10G, etc.).
- Con cuantizaciones mas agresivas (Q2_K, Q3_K), el modelo podria caber en GPUs de 16 GB (RTX 4080, RTX 3080 Ti), aunque con perdida de calidad.
- Para contextos largos (256K tokens), se requiere memoria adicional; se recomienda usar cuantizaciones bajas y gestionar el contexto de forma dinamica.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base (safetensors), se puede usar vLLM o TGI.
- La latencia y el throughput dependen de la cuantizacion y el hardware; al ser un MoE con solo 3.3B parametros activos, la velocidad de generacion es superior a la de un modelo denso de tamano similar.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo es comparable a otros modelos de codificacion MoE como DeepSeek-Coder-V2-Lite (16B totales, 2.4B activos) o Qwen2.5-Coder-32B (denso), pero no se han encontrado benchmarks publicados que permitan una comparacion cuantitativa en esta ficha.

## Limitaciones y advertencias

- El modelo solo soporta modo no-thinking, por lo que no genera razonamiento explicito; esto puede limitar su capacidad para tareas que requieren cadenas de pensamiento complejas.
- Riesgo de alucinacion en codigo: puede generar codigo incorrecto o inventar APIs inexistentes, especialmente en contextos poco comunes.
- Sesgos potenciales derivados de los datos de entrenamiento, que pueden reflejarse en estilos de codigo o preferencias de ciertos lenguajes.
- No se especifican los idiomas soportados; aunque Qwen suele ser multilingue, no hay confirmacion para este modelo.
- El contexto largo (256K) puede requerir una gestion cuidadosa de la memoria, y el uso de Yarn para 1M puede degradar el rendimiento si no se configura adecuadamente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original para cualquier restriccion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Blog oficial de Qwen3-Coder: https://qwenlm.github.io/blog/qwen3-coder/
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de Unsloth para Qwen3-Coder: https://docs.unsloth.ai/basics/qwen3-coder
- Coleccion de Unsloth con todas las versiones de Qwen3: https://huggingface.co/collections/unsloth/qwen3-680edabfb790c8c34a242f95
