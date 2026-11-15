# sul696/miss-blupsy-8b

## Resumen

Miss Blupsy 8B es un modelo de lenguaje de 8.190.735.360 parámetros publicado por el usuario sul696 en Hugging Face, concebido como el motor de un asistente de escritorio llamado Miss Blupsy que se ejecuta íntegramente en local, sin conexión a internet ni cuentas de usuario. El modelo se distribuye principalmente en formato GGUF con cuantización Q4_K_M (unos 5,1 GB) y va acompañado de cuatro adaptadores LoRA en GGUF especializados por función: herramientas del sistema, gestión de archivos, redacción de mensajes y escritura larga por secciones.

El modelo está orientado a tareas de asistente sobre el propio ordenador: abrir aplicaciones, buscar archivos, crear recordatorios y redactar textos. Soporta árabe (tanto dialecto del Golfo como árabe estándar moderno) e inglés, y se publica bajo licencia Apache 2.0, lo que permite uso comercial. Su relevancia radica en el enfoque *on-device* con requisitos modestos (unos 8 GB de VRAM) y en la separación de capacidades mediante adaptadores, un patrón poco habitual en modelos de asistente de este tamaño.

La información pública disponible es escasa: no se especifican la arquitectura base, la longitud de contexto ni los detalles del entrenamiento más allá de una descripción general de las fuentes de datos. Los datos de rendimiento que ofrece el autor provienen de las pruebas internas de su propia aplicación, no de benchmarks estándar de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, base no especificada) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (archivo principal, ~5,1 GB); adaptadores LoRA también en GGUF |
| Idiomas soportados | árabe (dialecto del Golfo y árabe estándar moderno) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base y adaptadores); el repositorio incluye safetensors según los metadatos de parámetros |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de transformer, número de capas, atención, vocabulario ni longitud de contexto). El dato disponible es el recuento de parámetros (8.190.735.360) y el hecho de que se distribuye en GGUF cuantizado a Q4_K_M junto con cuatro adaptadores LoRA en GGUF que especializan el comportamiento: `tools.gguf` para acciones sobre el sistema (abrir, buscar, recordar), `adapters/files.gguf` para lectura y manipulación de archivos, `adapters/writing.gguf` para mensajes, cartas y documentos, y `adapters/long.gguf` para escritura larga por secciones.

En cuanto al entrenamiento, la model card indica que los datos proceden de ejemplos generados por código a partir de las herramientas y reglas de la propia aplicación, conjuntos de datos de licencia abierta que permiten entrenamiento comercial y ejemplos propios del creador. Se afirma explícitamente que no se utilizaron salidas de servicios comerciales de IA cerrados. No se detalla el número de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y árabe (dialecto del Golfo y árabe estándar moderno).
- Ejecución de acciones sobre el ordenador mediante el adaptador de herramientas: abrir aplicaciones, localizar elementos y crear recordatorios.
- Lectura y manipulación de archivos del usuario mediante el adaptador dedicado.
- Redacción de mensajes, cartas y documentos con un adaptador específico.
- Escritura de textos largos generados sección a sección mediante el adaptador `long`.
- Respuesta a preguntas sobre la propia aplicación (el autor reporta un 100% en su conjunto de pruebas interno).
- Funcionamiento completamente local y sin conexión, sin enviar datos fuera del dispositivo.
- No se documenta soporte de *tool calling* en formato estándar (JSON Schema), razonamiento multi-paso genérico, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistente de escritorio local: el modelo gestiona las interacciones del asistente Miss Blupsy en el propio ordenador del usuario, sin conexión, lo que encaja en escenarios con requisitos de privacidad estrictos (entornos corporativos, datos personales).
- Automatización de tareas del sistema: con el adaptador de herramientas, puede interpretar órdenes como abrir una aplicación o crear un recordatorio y traducirlas en acciones concretas; el autor reporta 0 acciones erróneas en su conjunto oculto de pruebas.
- Búsqueda y organización de archivos: el adaptador de archivos permite localizar y trabajar con documentos del disco, útil para asistentes de productividad personal.
- Redacción asistida de comunicaciones: generación de mensajes, cartas y documentos en inglés o árabe para usuarios que trabajan en ambos idiomas.
- Generación de documentos largos: el adaptador `long` permite producir textos extensos por secciones, adecuado para informes o borradores que superan la longitud de una respuesta única.
- Atención en árabe del Golfo: pocos modelos de este tamaño cubren el dialecto del Golfo de forma explícita, lo que lo hace útil para asistentes dirigidos a usuarios de la península arábiga.
- Despliegue en equipos de gama media: al requerir unos 8 GB de VRAM en Q4_K_M, puede ejecutarse en estaciones de trabajo con GPU de consumo, sin infraestructura en la nube.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de la aplicación del autor, no benchmarks estándar de la comunidad:

| Prueba (interna de la app) | Resultado |
|---|---|
| Herramientas (conjunto propio) | 95,3% |
| Herramientas (conjunto oculto) | 92,2% |
| Acciones erróneas en conjunto oculto | 0 |
| Seguridad | 100% |
| Preguntas sobre la app | 100% (conjunto oculto: 97%) |
| Tareas reales | 50 de 50 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 8 GB para el modelo en Q4_K_M (~5,1 GB de pesos más overhead de contexto y adaptadores).
- GPU recomendadas: no se especifican modelos concretos; el autor indica "una tarjeta gráfica con unos 8 GB de memoria". Cualquier GPU con 8 GB o más (RTX 3060 Ti/4060 Ti, RTX 3070/4070, etc.) debería ser suficiente en teoría.
- Cabe en GPU de consumo: sí, según el requisito de ~8 GB indicado por el autor.
- Alternativa sin GPU: el autor indica que puede ejecutarse en un procesador potente, con mayor latencia.
- Opciones de despliegue: al distribuirse en GGUF, es compatible con llama.cpp y derivados como Ollama; los metadatos incluyen la etiqueta `endpoints_compatible`. No se documentan otras opciones (vLLM, TGI) ni configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: no se conocen la arquitectura base, el contexto ni los benchmarks estándar del modelo, y sus métricas publicadas son internas y no comparables. Como referencia de categoría (asistente local de ~8B en GGUF, licencia permisiva):

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Miss Blupsy 8B | 8,19B | no disponible | Apache 2.0 | GGUF + adaptadores | Asistente de escritorio, árabe e inglés; métricas solo internas |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Referencia generalista; benchmarks públicos |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Fuerte en árabe y multilingüe; benchmarks públicos |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | safetensors, GGUF | Referencia generalista en 7-8B |

Los datos de los modelos comparados corresponden a conocimiento general de la categoría; no se han verificado contra la información proporcionada en esta búsqueda.

## Limitaciones y advertencias

- Información técnica muy limitada: se desconocen arquitectura, contexto, tokenizador y detalles del entrenamiento, lo que dificulta evaluar su idoneidad fuera del caso de uso previsto.
- Las métricas publicadas (95,3% en herramientas, 100% en preguntas sobre la app) provienen de las pruebas internas del autor y no han sido verificadas de forma independiente ni comparadas con benchmarks estándar.
- Modelo altamente especializado en el asistente Miss Blupsy: su rendimiento como modelo generalista de razonamiento, código o matemáticas no está documentado y probablemente sea inferior a modelos generalistas del mismo tamaño.
- Cobertura lingüística limitada a árabe (Golfo y estándar) e inglés; no se documenta soporte de castellano.
- Riesgo de alucinación no evaluado: no hay datos sobre tasas de alucinación ni sobre el comportamiento del modelo fuera de las tareas del asistente.
- Sesgos desconocidos: no se publica información sobre evaluación de sesgos ni sobre la composición detallada de los datos de entrenamiento.
- Dependencia de los adaptadores: las capacidades de herramientas, archivos y redacción dependen de los LoRA incluidos; usos fuera del ecosistema de la app pueden no funcionar como se espera.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo `NOTICE` del repositorio por si incluye atribuciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sul696/miss-blupsy-8b
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
