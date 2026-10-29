# webxos/microd-bigram-v2

## Resumen

`webxos/microd-bigram-v2` (etiquetado internamente como MICROD-BIGRAM-V2.5) no es un modelo de lenguaje basado en transformer, sino un **modelo bigram de caracteres** publicado en HuggingFace por el usuario `webxos`. El artefacto consiste esencialmente en una tabla de transición de 27×27 entradas que almacena la frecuencia con la que un carácter sigue a otro, generada a partir de corpus abiertos (la model card cita `names.txt` de Andrej Karpathy) y exportada como `model.json` dentro de un bundle `.zip` con formato propio `mD-v2` / versión `2.5.0`.

El modelo se produce con **Micro Distillery v2.5**, una aplicación web de un solo archivo HTML (PWA) que descarga corpus, cuenta pares de caracteres, aplica un post-procesado opcional mediante APIs externas (LanguageTool, MyMemory, Datamuse) y exporta un paquete listo para subir a HuggingFace. La model card describe además un bucle de "policy-gradient simplificado (estilo GRPO)" para el entrenamiento de trayectorias a nivel de carácter, campos VAE registrados únicamente como metadatos y una "superposición de 4 osciladores armónicos cuánticos" que, según el propio autor, funciona solo como generador pseudoaleatorio determinista para fijar la semilla (1251963776).

Su relevancia es, por tanto, **didáctica y de infraestructura**, no de rendimiento: sirve para ilustrar los fundamentos de la predicción de siguiente token con un modelo Markoviano de orden 1, para probar pipelines de publicación de artefactos en HuggingFace y para demostrar capas de post-proceso NLP en el navegador. Con 209 descargas y 6 "likes" en el momento de la consulta, es un proyecto experimental de nicho, sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo bigram de caracteres (cadena de Markov de orden 1) materializado como tabla de transición de 27×27; sin pesos de transformer |
| Parámetros totales | No aplicable en el sentido habitual: 729 entradas en la tabla de transición (27×27). El autor no publica un recuento de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Por diseño, la dependencia se limita al carácter inmediatamente anterior (orden 1) |
| Tipos de cuantización | No aplica: los valores son probabilidades/frecuencias de transición, no pesos en coma flotante de una red neuronal |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.json` (tabla de transición) dentro de un bundle `.zip` con esquema `mD-v2` / `2.5.0`; el paquete incluye `config.json`, `vocab.json`, `test.py` (wrapper de prueba en Python), `README.md`, `pipeline.svg` y utilidades opcionales como `to_parquet.py` |
| Librería declarada | `micro-distillery` (propia, no estándar de HuggingFace Transformers) |
| Modelos base declarados | HuggingFaceTB/SmolLM2-135M, Qwen/Qwen2.5-0.5B, allenai/OLMo-2-0425-1B, TinyLlama/TinyLlama-1.1B-Chat-v1.0 (usados como referencia en las etiquetas, no como inicialización de pesos) |
| Entorno de ejecución | Navegador (PWA) o Python 3.8+ |

## Arquitectura y entrenamiento

La arquitectura es una **tabla de transición de caracteres de orden 1**: para cada uno de los 27 símbolos del vocabulario (probablemente 26 letras más un token de fin de secuencia) se almacena la distribución de frecuencias del carácter siguiente. La generación consiste en muestrear secuencialmente de esa tabla, sin atención, sin capas ocultas y sin representaciones vectoriales aprendidas. No hay embeddings contextuales ni mecanismo alguno de memoria más allá del carácter previo, lo que sitúa al modelo en la clase más simple de generador de lenguaje estadístico.

El proceso de construcción descrito en la model card incluye: descarga de corpus abiertos en el navegador, conteo de pares de caracteres, una "optimización de rutas" mediante un bucle de refuerzo basado en reglas, y el citado módulo de semilla determinista. Cabe señalar que las etiquetas `grpo` y `vae` **no corresponden a una implementación estándar de GRPO ni a un autoencoder variacional**: el autor indica explícitamente que los campos VAE se registran solo como metadatos y no afectan a la tabla de transición, y que la superposición de osciladores armónicos se usa exclusivamente como PRNG. No se publican datos sobre volumen de tokens de entrenamiento, composición del corpus, ni fases de RLHF/DPO.

## Capacidades

- Generación de texto a nivel de carácter: produce cadenas verosímiles en la distribución del corpus de entrenamiento (por ejemplo, nombres inventados con patrones ortográficos plausibles en inglés).
- Predicción de siguiente carácter mediante consulta directa a la tabla de transición 27×27.
- Reproducibilidad determinista: la semilla fija (1251963776) garantiza que la tabla exportada y las rutas de muestreo sean idénticas en cualquier máquina.
- Capa "Jev Code Nous": un arnés local y determinista que simula un pipeline de predicción de tokens orientado a código (tokenizar → contexto → candidatos → puntuar → seleccionar → validar) con confirmación del usuario. Es una simulación/arnés, no un motor de generación de código funcional.
- Post-proceso opcional en inferencia (fan-out): comprobación gramatical vía LanguageTool (público o autoalojado en Docker), paráfrasis/retrotraducción vía MyMemory con control de cuota diaria, y puntuación léxica vía Datamuse con caché local.
- Exportación de artefactos: generación automática de un bundle `.zip` compatible con HuggingFace (config, vocab, wrapper de test, model card, diagramas SVG).
- No soporta tool calling nativo, function calling, agentes, razonamiento multi-paso, matemáticas, visión, audio ni modo "thinking".

## Casos de uso

- **Docencia de fundamentos de modelos de lenguaje**: sirve para explicar en clase, con código ejecutable, la diferencia entre un bigrama de Markov y un transformer, mostrando por qué un modelo de orden 1 genera texto localmente plausible pero globalmente incoherente.
- **Generación de datasets sintéticos de nombres para pruebas**: alimentar tests de validación de formularios, pipelines de anonimización o fixtures de bases de datos con identificadores ficticios que respetan patrones ortográficos del inglés.
- **Smoke test de infraestructura de publicación de modelos**: el bundle `mD-v2` permite verificar de extremo a extremo el flujo de subida, versionado y descarga de artefactos en HuggingFace sin consumir GPU ni ancho de banda significativo.
- **Prototipado de capas de post-proceso NLP**: el panel fan-out con LanguageTool, MyMemory y Datamuse permite evaluar latencias, cuotas y modos de fallo (CORS, timeouts, cuota agotada) de estas APIs antes de integrarlas en un pipeline real.
- **Banco de pruebas de reproducibilidad**: útil para comprobar que dos entornos distintos (Python 3.8+ y navegador) producen exactamente la misma tabla de transición a partir de la misma semilla, un requisito habitual en auditorías de artefactos.
- **Demostración offline-first en el navegador**: al ser una PWA de un solo archivo, permite talleres o demos sin conectividad ni backend, entrenando y ejecutando el modelo en la propia pestaña.
- **Generación de semillas léxicas para data augmentation**: producir candidatos de nombres o cadenas cortas que luego se filtran con modelos mayores, útil para aumentar diversidad en tareas de etiquetado de entidades ficticias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa, y tampoco se han encontrado resultados en los repositorios o páginas de terceros consultados. Cualquier cifra de calidad atribuida a este artefacto debe considerarse no verificada.

## Requisitos de hardware

- **VRAM**: no requiere GPU. La inferencia opera sobre una tabla de 729 enteros en memoria principal.
- **Memoria RAM**: despreciable (órdenes de kilobytes para la tabla); el autor no publica el tamaño exacto del bundle `.zip`.
- **GPU recomendadas**: ninguna. El entrenamiento y la inferencia se ejecutan en CPU, y el entrenamiento puede correr íntegramente en el navegador.
- **Consumer GPU**: irrelevante; funciona en cualquier portátil, e incluso en dispositivos móviles modernos a través del navegador.
- **Opciones de despliegue**: la propia PWA de un solo archivo HTML (offline tras la primera carga), o el wrapper `test.py` incluido en el bundle con Python 3.8+. No hay soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF/safetensors, ya que el artefacto no es un modelo neuronal.
- **Latencia y throughput**: no se publican mediciones. Por la naturaleza del artefacto (una consulta a tabla y un muestreo por carácter), la latencia esperada es de microsegundos por carácter en CPU; no se dispone de cifras oficiales del autor.
- **Dependencias de red en inferencia opcional**: el post-proceso fan-out requiere acceso a `api.languagetool.org`, MyMemory y Datamuse, salvo que se autoalojen (se documenta un quick-start con Docker para LanguageTool).

## Comparativa con modelos similares

La comparación directa es problemática porque este artefacto no pertenece a la misma clase que los modelos citados como base. Se incluye a título orientativo, marcando explícitamente los datos no verificados en la información proporcionada.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webxos/microd-bigram-v2 | Bigrama de caracteres (tabla 27×27) | 729 entradas de tabla (no se publica recuento de parámetros) | Orden 1 (un carácter); longitud de contexto no disponible | Apache 2.0 | HuggingFace, bundle `.zip` + PWA |
| HuggingFaceTB/SmolLM2-135M | Transformer decoder-only | 135M (según el nombre del modelo) | No verificado en la información disponible | No verificado en la información disponible | HuggingFace |
| Qwen/Qwen2.5-0.5B | Transformer decoder-only | 0,5B (según el nombre del modelo) | No verificado en la información disponible | No verificado en la información disponible | HuggingFace |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | Transformer decoder-only | 1,1B (según el nombre del modelo) | No verificado en la información disponible | No verificado en la información disponible | HuggingFace |

Nota: los cuatro modelos aparecen citados en el campo `base_model` del repositorio, pero el bigrama no se inicializa a partir de ellos ni comparte su arquitectura; la relación es de etiquetado, no de destilación efectiva de pesos.

## Limitaciones y advertencias

- **Ausencia total de comprensión semántica**: al depender solo del carácter anterior, el modelo no puede mantener coherencia a nivel de palabra, frase o documento. El texto generado es, en el mejor de los casos, morfológicamente plausible.
- **Contexto efectivamente nulo**: no admite instrucciones, prompts, system messages ni ventanas de contexto; cualquier caso de uso conversacional o de razonamiento queda fuera de su alcance.
- **Idioma**: solo inglés; el vocabulario de 27 símbolos no cubre acentos, diacríticos ni caracteres no ASCII, lo que lo inutiliza para castellano.
- **Discrepancia entre etiquetas y arquitectura**: las etiquetas `grpo`, `vae` y `distilled` sugieren técnicas que la propia model card describe como simuladas o meramente declarativas (VAE como metadatos, osciladores cuánticos como PRNG). Conviene tratar el vocabulario técnico de la ficha con escepticismo.
- **Riesgo de alucinación conceptual**: el uso de términos como "quantum harmonic oscillator superposition" para describir un generador pseudoaleatorio puede inducir a error a lectores no expertos sobre las capacidades reales del artefacto.
- **Sin evaluación publicada**: no hay benchmarks, métricas de perplejidad ni validación humana; no es posible comparar su calidad de forma objetiva.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y aviso de cambios, pero el valor práctico en producción es prácticamente nulo más allá de tareas didácticas o de prueba.
- **Dependencia de APIs externas para el post-proceso**: LanguageTool, MyMemory y Datamuse introducen límites de cuota, latencia de red y restricciones CORS; no son aptos para pipelines de baja latencia.
- **Mantenimiento**: librería propia (`micro-distillery`) no estándar, sin ecosistema de herramientas compatible; la trazabilidad depende de un único autor.
- **Formato propietario**: el bundle `mD-v2` no es interoperable con `transformers`, `safetensors` ni GGUF, lo que impide reutilizar tooling estándar de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webxos/microd-bigram-v2
- Carpeta de la PWA dentro del repositorio: https://huggingface.co/webxos/microd-bigram-v2/tree/main/micro-distillery-pwa
- Versión previa del modelo (microd_v2): https://huggingface.co/webxos/microd_v2
- Ficha de terceros con índice de popularidad de microd_v2: https://free2aitools.com/model/webxos/microd_v2
- Repositorio MicroCUDA del mismo autor: https://github.com/webxos/microcuda
- Comparativa de terceros no relacionada con el modelo (referencia de benchmark): https://goldiebench.com/tasks/webos
- Paper, blog técnico o demo oficial: no disponible en la información proporcionada.
