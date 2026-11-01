# viitheone/4thwall-waf-v2.1b

## Resumen

4thwall-WAF-v2.1b es un modelo de clasificación de texto multi-etiqueta desarrollado por el equipo de 4thwall Security, orientado a la detección de tráfico web malicioso en tiempo real. Se trata de un fine-tuning de `distilbert-base-uncased` (6 capas, 768 dimensiones ocultas, 12 cabezas de atención) sobre más de 363.000 peticiones HTTP reales y de honeypot, con agrupación estricta por plantilla para evitar fugas estructurales de URI. El modelo clasifica cada petición en 13 categorías CAPEC (Normal más 12 vectores de ataque) mediante clasificación multi-etiqueta con umbrales calibrados por clase.

El problema que resuelve es la sustitución de reglas regex frágiles en firewalls de aplicación web por un clasificador semántico capaz de generalizar ante variantes de inyección. Su relevancia radica en las métricas reportadas sobre un conjunto de test con 29.996 URIs de plantilla no vista: Macro-F1 de 0,9923 excluyendo la clase 272, Macro-F1 de 0,9830 sobre las 13 clases, Micro-F1 de 0,9912, tasa de captura de exploits del 99,41% y tasa de falsos positivos sobre tráfico benigno limpio del 0,782%.

Con 66,4 millones de parámetros y un repositorio de 0,5 GB, el modelo está pensado para despliegue en línea dentro de una arquitectura de dos niveles (bloqueo y alerta), lo que permite integrarlo en pipelines de inspección HTTP con latencia baja sin depender de un LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion) |
| Parametros totales | 66.372.877 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de distilbert-base-uncased; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder destilado de BERT con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención. Sobre esa base se añade una cabeza de clasificación multi-etiqueta con 13 salidas correspondientes a categorías CAPEC: Normal (000), Protocol Manipulation (272), Code Injection (242), OS Command Injection (88), Path Traversal (126), SQL Injection (66), Dictionary-based Password Attack (16), Scanning for Vulnerable Software (310), Input Data Manipulation (153), HTTP Verb Tampering (274), Fake the Source of Data (194), HTTP Response Splitting (34) y HTTP Request Smuggling (33). La decisión final se toma con sigmoide por clase y umbrales calibrados específicos por etiqueta, almacenados en `model.config.thresholds`.

El entrenamiento se realizó sobre más de 363.000 peticiones HTTP reales y de honeypot, con agrupación estricta por plantilla (template-disjoint grouping) para evitar que el modelo memorize estructuras de URI y generalice sobre plantillas no vistas. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La innovación principal es la serialización estructurada de la petición HTTP en una cadena con marcadores `[METHOD]`, `[PATH]`, `[UA]`, `[CT]` y `[BODY]`, que el modelo consume como texto plano.

## Capacidades

- Clasificación multi-etiqueta de peticiones HTTP en 13 categorías CAPEC con umbrales calibrados por clase.
- Detección semántica de inyección SQL, XSS y ejecución de código PHP (clase Code Injection, 242).
- Detección de inyección de comandos de sistema operativo (clase 88), incluyendo la categoría fusionada CAPEC-248.
- Detección de path traversal y local file inclusion, incluyendo rutas tipo `/etc/passwd` (clase 126).
- Detección de ataques de fuerza bruta y credential stuffing basados en diccionario (clase 16).
- Detección de escaneo de vulnerabilidades y reconocimiento con herramientas como sqlmap, nikto y nuclei (clase 310, configurada en nivel de alerta).
- Detección de manipulación de parámetros de entrada (clase 153).
- Detección de HTTP verb tampering con verbos no autorizados como TRACK, PROPFIND o PUT (clase 274).
- Detección de falsificación de origen de datos, spoofing de cabeceras e inyección de proxy SSRF (clase 194).
- Detección de HTTP response splitting y CRLF header injection (clase 34).
- Detección de HTTP request smuggling (clase 33, con umbral de 0,95).
- Detección de manipulación de protocolo (clase 272) con umbral de 0,99 para eliminar falsos positivos de rastreadores sin cabeceras.
- Serialización de peticiones HTTP mediante el método `serialize_request` expuesto por el modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo discriminativo, no generativo).
- Capacidades multilingües: limitadas al inglés (`en`).
- Capacidades especiales: política operativa de dos niveles (BLOCK y ALERT) y umbrales por clase calibrados.

## Casos de uso

- Firewall de aplicación web en línea: el modelo inspecciona cada petición HTTP serializada y aplica los umbrales calibrados por clase para devolver HTTP 403 en la capa BLOCK o registrar en SIEM en la capa ALERT, sustituyendo reglas regex por clasificación semántica.
- Detección de inyección SQL en APIs: con umbral de 0,70 y una recall reportada del 99,2% y precisión de 0,996 en la clase 66, se puede integrar como paso previo a la consulta a base de datos en pasarelas API.
- Mitigación de XSS y ejecución de código: la clase 242 (Code Injection) con umbral 0,65 permite bloquear payloads de tipo `` y ejecución PHP antes de que lleguen al servidor de aplicación.
- Protección contra path traversal y LFI: la clase 126 con umbral 0,90 detecta rutas como `/../../../../etc/passwd` en servidores de ficheros o paneles de administración.
- Defensa contra credential stuffing: la clase 16 con umbral 0,60 identifica patrones de fuerza bruta y relleno de credenciales en endpoints de autenticación.
- Reducción de ruido de escáneres: la clase 310 en nivel ALERT con umbral 0,55 permite identificar reconocimiento con sqlmap, nikto o nuclei sin bloquear rastreadores legítimos.
- Detección de smuggling y response splitting en proxies inversos: las clases 33 (umbral 0,95) y 34 (umbral 0,60) permiten identificar inyección CRLF y desincronización de peticiones en balanceadores y CDN.
- Enriquecimiento de SIEM: las salidas multi-etiqueta con puntuaciones por clase se pueden enviar a un SIEM para correlación y ajuste de políticas sin bloquear tráfico automáticamente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Macro-F1 (excl. clase 272) | 0,9923 |
| Macro-F1 (13 clases) | 0,9830 |
| Micro-F1 | 0,9912 |
| Exploit Catch Rate | 99,41% (22.448 / 22.582 filas de ataque) |
| Clean Benign False Positive Rate | 0,782% (58 / 7.414) |
| Conjunto de test | 29.996 URIs de plantilla no vista (Unique-Template) |

No se han publicado resultados comparativos con otros modelos WAF en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 265 MB para los 66,4 millones de parámetros, más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB en FP32.
- VRAM estimada en FP16: aproximadamente 133 MB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para despliegues de bajo throughput.
- Opciones de despliegue: `transformers` con PyTorch, `safetensors`, y potencialmente `vLLM` o `TGI` para clasificación por lotes; no se documentan variantes GGUF ni soporte explícito de `llama.cpp` u `Ollama`.
- Latencia y throughput estimados: no disponibles en la model card; por el tamaño del modelo (DistilBERT), se espera latencia de milisegundos por petición en GPU y decenas de milisegundos en CPU, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 4thwall-WAF-v2.1b | 66,4 M | no disponible | Clasificacion multi-etiqueta WAF (13 clases CAPEC) | apache-2.0 | HuggingFace |
| distilbert-base-uncased | 66 M | 512 tokens | Clasificacion de texto generica | apache-2.0 | HuggingFace |
| Modelos WAF basados en regex o firmas | no aplica | no aplica | Deteccion por patron | variable | Ampliamente desplegados |

No se dispone de datos de benchmarks comparativos con otros modelos WAF neuronales en la información proporcionada, por lo que la comparativa se limita a la arquitectura base y a enfoques no neuronales.

## Limitaciones y advertencias

- El modelo solo soporta inglés (`en`); peticiones con contenido en otros idiomas pueden degradar la detección.
- La longitud de contexto no está declarada explícitamente; al heredar de `distilbert-base-uncased`, se espera un límite de 512 tokens, lo que puede truncar peticiones con cuerpos muy largos.
- La clase 272 (Protocol Manipulation) tiene un umbral de 0,99 para evitar falsos positivos de rastreadores; esto implica que ataques reales de manipulación de protocolo pueden pasar sin alerta si no superan ese umbral.
- La tasa de falsos positivos benignos reportada (0,782%) se midió sobre tráfico benigno limpio; en entornos reales con tráfico legítimo anómalo la tasa puede ser mayor.
- El modelo es discriminativo y no genera explicaciones; las decisiones de bloqueo deben complementarse con logs y revisión humana.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en peticiones ambiguas o adversariales.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad operativa recae en el integrador.
- La model card no documenta sesgos conocidos ni evaluación de robustez frente a ataques adversariales.
- El repositorio tiene 46 descargas y 0 likes en el momento de la consulta, lo que indica adopción muy limitada y poca validación externa.
- El código de ejemplo de la model card usa `trust_remote_code=True` y un `MODEL_ID` de marcador (`your-username/...`), lo que sugiere que el autor no ha verificado el quickstart tal cual.
- La fecha de creación indicada (2026-10-26) es futura respecto a la fecha habitual de consulta, lo que puede indicar un error en los metadatos del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/viitheone/4thwall-waf-v2.1b
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
