# westlake-repl/Pinal

## Resumen

Pinal es un marco de diseno de proteinas desarrollado por el laboratorio westlake-repl (Westlake University) que traduce instrucciones en lenguaje natural en secuencias de proteinas novedosas. El sistema opera en dos etapas: primero genera estructuras proteicas a partir de la intencion de diseno expresada en texto y, a continuacion, disena la secuencia de aminoacidos condicionada por esa estructura. El modelo principal cuenta con 16 mil millones de parametros y se ha entrenado sobre un corpus de 1.700 millones de pares proteina-texto.

La relevancia del modelo radica en su enfoque "programable": el usuario describe la funcion o propiedad deseada en lenguaje natural y el sistema produce candidatos estructurales y secuenciales coherentes con esa descripcion, lo que reduce la dependencia de pipelines manuales de diseno computacional. El trabajo se publico en *Nature* en 2026 bajo el titulo "Programmable design of functional proteins from natural language".

El repositorio incluye dos componentes auxiliares: SaProt-T, especializado en *protein reverse folding* (estructura a secuencia) dentro del marco Pinal, y SaProt-O, entrenado con entradas configurables (prompts textuales opcionales y caracteristicas estructurales) para escenarios de investigacion reales. El modelo esta etiquetado para biologia y proteina, con idioma declarado ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (marco de dos etapas: generacion de estructura condicionada por texto y reverse folding estructura-secuencia) |
| Parametros totales | 16 mil millones (modelo Pinal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repositorio: 137,7 GB) |

## Arquitectura y entrenamiento

Pinal se estructura como un pipeline de dos fases. La primera fase genera estructuras proteicas a partir de instrucciones en lenguaje natural; la segunda aplica un modelo de *reverse folding* (SaProt-T) que produce la secuencia de aminoacidos compatible con la estructura generada. El componente SaProt-O amplia esta logica permitiendo entradas configurables, con prompts textuales opcionales y caracteristicas estructurales, para adaptarse a flujos de investigacion donde no siempre se dispone de una instruccion textual completa.

El entrenamiento se realizo sobre 1.700 millones de pares proteina-texto, una escala que el autor presenta como clave para la mejora en rendimiento y generalizacion hacia estructuras proteicas novedosas. La model card no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de estructuras proteicas a partir de descripciones en lenguaje natural (diseno condicionado por texto).
- *Reverse folding*: diseno de secuencias de aminoacidos dada una estructura proteica, mediante SaProt-T.
- Diseno programable de proteinas funcionales: el usuario especifica la funcion o propiedad deseada y el sistema propone candidatos.
- Generalizacion a estructuras proteicas novedosas, segun declara el autor.
- Entradas configurables en SaProt-O: acepta prompts textuales opcionales y caracteristicas estructurales.
- Procesamiento en ingles (unico idioma declarado en la model card).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Diseno de enzimas de novo: el investigador describe en texto la reaccion o actividad catalitica deseada y Pinal genera estructuras candidatas y sus secuencias correspondientes, que despues se validan experimentalmente en laboratorio.
- Ingenieria de proteinas de union: descripcion textual del ligando o diana y generacion de estructuras con sitios de union plausibles, seguido de reverse folding para obtener secuencias expresables.
- Optimizacion de estabilidad proteica: uso de SaProt-O con caracteristicas estructurales para redisenar secuencias manteniendo el pliegue y mejorando propiedades fisicoquimicas.
- Generacion de bibliotecas de candidatos: produccion masiva de estructuras y secuencias diversas a partir de una misma instruccion, para cribado experimental posterior.
- Investigacion en biologia estructural: generacion de hipotesis estructurales para proteinas sin homologia conocida, aprovechando la generalizacion declarada a pliegues novedosos.
- Docencia y prototipado en bioinformatica: uso del servidor web o del codigo del repositorio para explorar el flujo texto-estructura-secuencia sin infraestructura propia.
- Flujos de diseno inverso en pipelines internos: integracion de SaProt-T como modulo de reverse folding dentro de herramientas propias de diseno proteico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 16 mil millones de parametros, la inferencia en precision completa requeriria del orden de decenas de GB de VRAM, pero no se confirman cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del modelo (16B) y del repositorio (137,7 GB) sugieren que la ejecucion local en GPU de consumo requeriria cuantizacion, no documentada.
- Opciones de despliegue: el autor remite al repositorio de GitHub (westlake-repl/Denovo-Pinal) para instrucciones de uso; no se mencionan vLLM, llama.cpp, Ollama ni TGI. Existe un servidor web en denovo-pinal.com.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no especifica la licencia, por lo que el uso comercial queda sin regularizar hasta consultar el repositorio o contactar con los autores.
- Idioma limitado al ingles segun los metadatos; no se documenta soporte multilingue.
- No se detallan sesgos del dataset de 1.700 millones de pares proteina-texto, lo que impide evaluar sesgos hacia familias proteicas sobrerrepresentadas.
- Riesgo de alucinacion estructural: las estructuras generadas son predicciones que requieren validacion experimental; no se documentan metricas de fiabilidad fisica.
- No se especifican limitaciones de contexto ni el formato de pesos, lo que complica la planificacion de despliegue.
- El modelo esta orientado a investigacion en biologia; no se documentan salvaguardas de bioseguridad en la informacion disponible.
- El repositorio es de gran tamano (137,7 GB), lo que exige infraestructura de almacenamiento y transferencia considerable.

## Enlaces

- Hugging Face: https://huggingface.co/westlake-repl/Pinal
- Paper en Nature: https://www.nature.com/articles/s41586-026-11205-z
- Servidor web: http://www.denovo-pinal.com/
- Repositorio GitHub: https://github.com/westlake-repl/Denovo-Pinal
