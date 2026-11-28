# tanepiper/termite-decide-0.8b

## Resumen

termite-decide-0.8b es un modelo de decisión especializado, desarrollado por tanepiper, que evalúa comandos de shell para la herramienta de seguridad termite. No genera texto libre: responde a preguntas cerradas sobre un comando (si solo lee, si mantiene ocultos los secretos y si podría causar daño) eligiendo entre opciones fijas, y también puede ordenar varios comandos por nivel de riesgo. Está construido sobre jaredpalmer/kev-0.8b, a su vez derivado de Qwen/Qwen3.5-0.8B-Base, y se distribuye en formato GGUF cuantizado Q8_0.

El modelo resuelve un problema muy concreto: añadir una capa de juicio semántico a un sistema de reglas de seguridad para agentes que ejecutan comandos de shell. Su diseño es deliberadamente conservador: en termite solo puede endurecer una decisión, nunca aprobar lo que las reglas rechazan. Es relevante para desarrolladores que construyen agentes de ejecución de comandos y necesitan un clasificador ligero, local y de baja latencia que complemente reglas deterministas.

Con 752.917.824 parámetros reales y un repositorio de 1,6 GB, es un modelo pequeño pensado para ejecutarse en local junto a llama.cpp. Su alcance es limitado y está documentado con honestidad por el autor: solo inglés, solo probado en macOS y con tasas de error conocidas en la detección de comandos peligrosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B-Base) con cabeza de puntero para clasificación |
| Parametros totales | 752.917.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de referencia en llama-server) |
| Tipos de cuantizacion | GGUF Q8_0 (versiones 0.1 y 0.2, 812 MB cada una) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de jaredpalmer/kev-0.8b (revisión `bf75a6a8848ea6960ff2ed108d9ed44c2941174f`), construido sobre Qwen/Qwen3.5-0.8B-Base (revisión `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`), ambos con licencia Apache 2.0. Sobre esa base se aplicó un ajuste LoRA de rango 16 con una cabeza de puntero, en una sola pasada, con learning rate 0,00005, batch size 8 y semilla 1. La pregunta sobre daño utiliza objetivos graduados, lo que permite al modelo asignar puntuaciones de riesgo en lugar de una clasificación binaria.

El conjunto de entrenamiento consta de 9.839 filas de decisión (la model card se corta en ese punto, por lo que la composición completa del dataset no está disponible). La versión 0.2 reconstruyó sus datos de entrenamiento usando únicamente fuentes con licencias claras, a diferencia del modelo base. El modelo no genera texto: selecciona entre opciones fijas, lo que reduce la superficie de error y facilita su integración como clasificador en un pipeline de decisión.

## Capacidades

- Clasificación de comandos de shell en tres dimensiones: solo lectura, ocultación de secretos y potencial de daño.
- Asignación de una puntuación graduada de peligrosidad (no solo binaria) en la versión 0.2.
- Ordenación de varios comandos por nivel de riesgo relativo.
- Respuesta mediante selección entre opciones fijas, sin generación de texto libre.
- Integración como endpoint compatible con la API de llama.cpp (`/v1/systemone`).
- Capacidad de endurecer decisiones: en termite solo puede hacer una respuesta más estricta, nunca más permisiva.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Multilingüismo: únicamente inglés; no se probó ningún otro idioma.

## Casos de uso

- Filtro de seguridad en agentes de shell: integrado en termite, el modelo evalúa cada comando propuesto por un agente antes de su ejecución y añade una capa semántica sobre las reglas deterministas, marcando comandos que las reglas dejan pasar pero que podrían ser peligrosos.
- Clasificación de solo lectura para políticas de permisos: el modelo determina si un comando únicamente lee datos, lo que permite aplicar políticas de ejecución automática a operaciones de lectura y reservar la confirmación humana para comandos de escritura.
- Detección de exposición de secretos: evalúa si un comando podría revelar credenciales o claves, útil en entornos con variables de entorno sensibles y ficheros de configuración con secretos.
- Priorización de alertas en revisión de comandos: al ordenar varios comandos por riesgo, permite a un revisor humano centrarse primero en los más peligrosos dentro de un lote de operaciones propuestas.
- Despliegue local de bajo coste: con 812 MB en Q8_0 y ejecución mediante llama.cpp, cabe en estaciones de trabajo sin GPU dedicada y añade latencia mínima a un pipeline de ejecución de comandos.
- Complemento de sistemas de reglas existentes: se puede usar como segunda opinión sobre las decisiones de un motor de reglas, ya que su diseño garantiza que solo puede endurecer, nunca relajar, una denegación.
- Evaluación en entornos de desarrollo con secretos simulados: el autor lo validó contra una máquina desechable con secretos falsos, un patrón replicable para probar políticas de seguridad antes de producción.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre conjuntos de prueba fijos:

| Medida | Kev-0.8B | 0.1 | 0.2 |
|---|---|---|---|
| Tau en la escalera (marca por encima de 0,703) | 0,548 | 0,698 | 0,678 |
| Comandos de nivel 3 o superior calificados como seguros, de 30 | 0 | 0 | 1 |
| Comandos de nivel 2 calificados como seguros, de 8 | 0 | 8 | 8 |
| Comandos inofensivos calificados como seguros, de 14 | 1 | 14 | 14 |
| Carpeta más arriesgada puntuada más alto, de 11 | 11 | 11 | 8 |
| Opción más segura en primer lugar, de 10 | 2 | 4 | 3 |

Prueba de comandos permitidos (141 comandos sin alertas de las reglas de termite):

| Medida | 0.1 | 0.2 |
|---|---|---|
| Comandos dañinos calificados como seguros, de 48 | 5 | 5 |
| Lecturas inofensivas calificadas como seguros, de 68 | 36 | 46 |

Marcas adicionales de la prueba permitida, fijadas tras ver los primeros resultados y superadas por 0.2: ningún comando dañino pasa tanto la política de solo lectura como el modelo (0); comandos dañinos calificados como seguros en la ruta de agente, no más de 2 de 5 (2 de 5); lecturas inofensivas permitidas por la política y calificadas como seguros, al menos 16 de 22 (19 de 22).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q8_0 (fichero de 812 MB más overhead de contexto de 4096 tokens).
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM; también funciona en CPU.
- GPU recomendadas: no se especifican; al ser un modelo de 0,8B en Q8_0, cualquier GPU moderna (RTX 3060 o superior) es sobrada. Para CPU, un procesador de escritorio convencional es suficiente.
- Opciones de despliegue: llama.cpp mediante `llama-server` es la única opción probada por el autor. Comando de referencia: `llama-server -hf tanepiper/termite-decide-0.8b -hff termite-decide-0.8b-0.2-Q8_0.gguf -c 4096 --port 8081`.
- Requiere un servidor con el endpoint `/v1/systemone`; otros backends (vLLM, TGI, Ollama) no han sido probados según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La model card únicamente compara las versiones 0.1 y 0.2 del propio modelo y su base Kev-0.8B. Como referencia estructural, el modelo base jaredpalmer/kev-0.8b (misma arquitectura y licencia Apache 2.0) obtiene puntuaciones inferiores en todas las medidas de la escalera de seguridad (tau 0,548 frente a 0,678 de la versión 0.2). No se conocen alternativas públicas de clasificación de seguridad de comandos de shell con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Omite algunos comandos dañinos: calificó como seguros 5 de 48 comandos dañinos en la prueba de comandos permitidos.
- No verifica que un comando sea real: ninguna de sus preguntas comprueba la existencia de programas u opciones; las reglas de termite cubren programas ausentes y líneas cortadas, pero no opciones inventadas.
- Es débil ordenando: la opción más segura quedó primera solo en 3 de 10 elecciones.
- La escalera de seguridad se usó para elegir entre ejecuciones, por lo que sus puntuaciones probablemente favorecen al modelo.
- Los conjuntos de prueba son pequeños: la escalera tiene 52 comandos y una sola fila mueve un recuento.
- La escalera se ejecutó en macOS; el uso en Linux no se probó por separado para esta versión.
- Solo inglés: no se probó ningún otro idioma.
- Las puntuaciones están comprimidas: los comandos inofensivos puntúan alrededor de 0,16 y los más peligrosos alrededor de 0,7; el autor desconoce la causa.
- Un comando de nivel 4 fue calificado como seguro (lista una carpeta de claves); las reglas de termite lo rechazan.
- Un comando escrito para engañar al modelo puede superarlo; no debe usarse como única comprobación de seguridad.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Kev-0.8B no reconstruyó sus datos de entrenamiento con fuentes de licencia clara, a diferencia de los datos de la versión 0.2.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí el riesgo de clasificación errónea descrito arriba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanepiper/termite-decide-0.8b
- Repositorio de termite: https://github.com/tanepiper/termite
- Documentación de la escalera de seguridad: https://tanepiper.github.io/termite/docs/safety-ladder/
- Cambios por versión: https://tanepiper.github.io/termite/models/termite/
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
