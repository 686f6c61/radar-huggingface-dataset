# westlake-repl/Pinal

## Resumen

Pinal es un marco de diseño de proteínas desarrollado por el grupo westlake-repl (Westlake University, China) que traduce intenciones de diseño expresadas en lenguaje natural a secuencias proteicas nuevas. A diferencia de los modelos de lenguaje proteico clásicos, que trabajan solo con secuencias o estructuras, Pinal opera en dos etapas: primero genera una estructura proteica a partir de la instrucción textual y después diseña la secuencia que adopta esa estructura. El modelo se presenta en el artículo «Programmable design of functional proteins from natural language», publicado en *Nature* en 2026.

La model card indica un total de 16 000 millones de parámetros y un entrenamiento sobre 1 700 millones de pares proteína-texto. El marco se apoya en dos componentes auxiliares: SaProt-T, desarrollado específicamente para *protein reverse folding* (diseño de secuencia dada una estructura) dentro de Pinal, y SaProt-O, entrenado con entradas configurables que admiten indicaciones textuales opcionales y características estructurales.

La relevancia actual del modelo está en el cambio de interfaz: en lugar de especificar manualmente la topología o la secuencia, el usuario describe la función deseada y el sistema propone candidatos. El artículo informa de actividades enzimáticas validadas experimentalmente y de mejoras en rendimiento relacionado con CO2, aunque la información disponible no incluye cifras concretas de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; marco de dos etapas (generación de estructura 3D desde lenguaje natural y diseño de secuencia sobre la estructura), con los componentes SaProt-T (reverse folding) y SaProt-O (entradas configurables) |
| Parámetros totales | 16 000 millones (16B), según la model card |
| Parámetros activos | no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (instrucciones en lenguaje natural; etiqueta de idioma «en») |
| Licencia | no disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | no disponible (repositorio de 137,7 GB; no se especifica el formato de los ficheros) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información disponible. Lo que sí se documenta es la organización funcional en dos etapas: un primer módulo genera estructuras proteicas a partir de instrucciones en lenguaje natural y un segundo módulo diseña la secuencia correspondiente a esa estructura. Sobre este esqueleto se apoyan SaProt-T, orientado a *protein reverse folding*, y SaProt-O, que admite entradas configurables con indicaciones textuales opcionales y características estructurales para adaptarse a escenarios de investigación reales.

El entrenamiento se realizó sobre 1 700 millones de pares proteína-texto, una escala que sugiere un corpus multimodal que empareja descripciones funcionales con datos estructurales y de secuencia. No se especifican en la información proporcionada el número de tokens, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La innovación técnica declarada es la generación condicionada por lenguaje a través de la estructura como representación intermedia, con mejoras en generalización a estructuras proteicas nuevas.

## Capacidades

- Generación de estructuras proteicas 3D a partir de descripciones en lenguaje natural (primera etapa del pipeline).
- Diseño de secuencias (*inverse folding* o *reverse folding*) condicionado a una estructura dada, mediante SaProt-T.
- Rediseño y edición de proteínas existentes con SaProt-O, incluyendo la posibilidad de aportar indicaciones textuales y rasgos estructurales como condiciones.
- Diseño de proteínas funcionales: el artículo reporta actividades enzimáticas validadas experimentalmente.
- Mejora declarada en rendimiento relacionado con CO2 (el resumen disponible está truncado y no detalla la métrica).
- Capacidad de generalización a estructuras proteicas novedosas, según la model card.
- Interfaz en lenguaje natural en inglés para expresar la intención de diseño.
- Servidor online público (Pinal 16B) además de la implementación en GitHub.
- No se documentan en la información disponible capacidades de *tool calling*, razonamiento multi-paso genérico, visión, audio ni modo *thinking*.

## Casos de uso

- Diseño de enzimas industriales: describir en inglés la reacción y el sustrato objetivo para obtener estructuras candidatas y sus secuencias, que después se expresan y caracterizan en el laboratorio; el enfoque en lenguaje natural reduce la necesidad de especificar a mano la topología del sitio activo.
- Rediseño de proteínas existentes para mejorar estabilidad o solubilidad: SaProt-O permite introducir la estructura de partida junto con indicaciones textuales sobre el cambio deseado, lo que encaja en campañas de optimización de candidatos ya validados.
- *Inverse folding* en pipelines de protein engineering: dada una estructura resuelta por cristalografía o predicha, SaProt-T propone secuencias compatibles que pueden sintetizarse y cribarse.
- Generación de librerías de variantes para evolución dirigida: usar el modelo como generador de diversidad informada por función antes del cribado experimental, reduciendo el espacio de búsqueda frente a mutagénesis aleatoria.
- Captura o conversión de CO2: el artículo menciona mejoras en rendimiento relacionado con CO2, lo que sitúa al modelo como herramienta para proponer candidatos en rutas de fijación de carbono, pendiente de validación experimental caso por caso.
- Prototipado rápido y docencia: el servidor público permite explorar la relación entre descripción funcional, estructura propuesta y secuencia sin infraestructura propia, útil para evaluar el enfoque antes de invertir en despliegue local.
- Filtrado previo a la síntesis: usar el pipeline como primer filtro para descartar diseños con plegamientos improbables antes de asumir el coste de síntesis génica y expresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y el resumen del artículo mencionan actividades enzimáticas validadas experimentalmente y mejoras en rendimiento relacionado con CO2, pero no se proporcionan cifras (MMLU, HumanEval, GSM8K u otras métricas de diseño proteico) que permitan construir una tabla comparativa.

## Requisitos de hardware

- El repositorio ocupa 137,7 GB, un tamaño coherente con múltiples copias de pesos de un modelo de 16B; conviene prever ese espacio en disco antes de la descarga.
- VRAM estimada para los pesos en precisión nativa (fp16/bf16, ~2 bytes por parámetro): en torno a 32 GB solo para los pesos del componente de 16B, más caché KV y activaciones; en la práctica, 40-48 GB para inferencia cómoda.
- Cuantización a 8 bits: aproximadamente 16 GB de pesos, con margen para overhead en GPU de 24 GB.
- Cuantización a 4 bits: aproximadamente 8-10 GB de pesos; cabría en GPUs de consumo, aunque la información disponible no confirma que existan pesos cuantizados publicados.
- Al ser un pipeline de dos etapas, hay que servir más de un componente (generación de estructura y diseño de secuencia); la VRAM total puede ser superior a la del bloque de 16B por sí solo.
- GPU recomendadas para precisión nativa: A100 80 GB, H100 80 GB o varias GPUs de 40 GB con paralelismo tensorial. En consumo, RTX 4090 (24 GB) solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: la información solo confirma la implementación oficial en el repositorio de GitHub (westlake-repl/Denovo-Pinal) y el servidor online. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmark en la información proporcionada que permitan una comparación cuantitativa. La comparación siguiente es cualitativa y se limita a lo que se puede afirmar con seguridad sobre el enfoque de cada herramienta.

| Modelo | Tipo de tarea | Entrada | Salida | Pesos abiertos | Licencia |
|---|---|---|---|---|---|
| Pinal | Diseño de proteínas guiado por lenguaje | Instrucción en inglés (y estructura, en la etapa de secuencia) | Estructura y secuencia | Sí (HuggingFace, 137,7 GB) | no disponible |
| RFdiffusion | Generación de esqueletos proteicos por difusión | Restricciones geométricas y motivos | Estructura (*backbone*) | Sí | no verificada en esta ficha |
| ProteinMPNN | *Inverse folding* | Estructura proteica | Secuencia | Sí | no verificada en esta ficha |
| ESM3 | Modelo generativo multimodal de proteínas | Secuencia, estructura y función | Secuencia y estructura | Parcial (versión abierta y API) | no verificada en esta ficha |

La diferencia principal de Pinal frente a estas alternativas es la interfaz: admite instrucciones en lenguaje natural como condición de diseño y encadena estructura y secuencia en un único marco, mientras que las herramientas citadas suelen cubrir solo una de las dos etapas y requieren condiciones geométricas o estructurales explícitas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si se permite uso comercial, redistribución o modificación de los pesos. Es un bloqueante potencial para producción.
- No se han publicado métricas de benchmarks en la información disponible; la evaluación se apoya en validaciones experimentales descritas en el artículo, sin cifras accesibles en esta ficha.
- Riesgo de diseños no funcionales: como cualquier generador de proteínas, puede producir secuencias que se plieguen de forma inestable, se agreguen o carezcan de actividad; toda propuesta requiere validación experimental.
- Idiomas: las instrucciones están pensadas para inglés; no se documenta soporte de castellano ni de otras lenguas.
- Longitud de contexto y límites de la instrucción textual: no disponibles, lo que impide planificar prompts largos con garantías.
- Sesgos del corpus: no se detalla la composición de los 1700 millones de pares proteína-texto, por lo que se desconoce la cobertura de familias proteicas, organismos y funciones; es probable que ciertas clases estén sobrerrepresentadas.
- Advertencia de bioseguridad: la generación de proteínas funcionales a partir de texto puede aplicarse a dianas sensibles; conviene aplicar controles de uso y revisión institucional antes de sintetizar candidatos.
- Requisitos de infraestructura elevados (137,7 GB de repositorio) y despliegue no documentado para servidores de inferencia estándar.
- Comunidad limitada: 179 descargas y 13 «likes» en HuggingFace en el momento de la consulta, con poca validación independiente disponible.
- La model card remite al README del repositorio de GitHub para el uso; no incluye instrucciones de inferencia ni ejemplos de código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/westlake-repl/Pinal
- Repositorio de código: https://github.com/westlake-repl/Denovo-Pinal
- Artículo en Nature: https://www.nature.com/articles/s41586-026-11205-z
- Servidor online (Pinal 16B): http://www.denovo-pinal.com/
- Árbol de ficheros del modelo: https://huggingface.co/westlake-repl/Pinal/tree/main
