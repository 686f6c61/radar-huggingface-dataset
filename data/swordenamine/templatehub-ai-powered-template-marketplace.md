# swordenamine/TemplateHub-AI-Powered-Template-Marketplace

## Resumen

`swordenamine/TemplateHub-AI-Powered-Template-Marketplace` no es un modelo de inteligencia artificial: es el repositorio del código fuente de una aplicación web completa. Concretamente, una tienda online construida con Flask 2.3 que utiliza la API de DeepSeek (compatible con OpenAI) para idear y redactar el contenido de plantillas profesionales y, a partir de ese texto, generar ficheros reales en formato PPTX, XLSX, DOCX y PDF que se ponen a la venta. El repositorio lo publica el usuario `swordenamine`, acumula 0 descargas y 0 likes, y no declara licencia, idiomas ni pipeline.

La relevancia del proyecto es de ingeniería de software, no de investigación en IA: sirve como andamiaje funcional para montar un marketplace de productos digitales o un pipeline de generación documental en pocas horas. Incluye autenticación de administrador por contraseña, carrito de sesión, integración de cobro con Stripe Checkout (con modo demo si no hay claves), catálogo persistido en `products.json`, registro de pedidos en `orders.json` y una API JSON en `/api/products`.

Conviene señalar que la ficha se ha redactado con la información pública disponible, que es exclusivamente la model card del autor. No hay pesos, no hay datos de entrenamiento propios, no hay benchmarks y no hay licencia declarada, de modo que la mayoría de los campos técnicos habituales se marcan como no disponibles o no aplicables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: aplicación web Flask 2.3 (patrón MVC ligero con plantillas Jinja2); no contiene pesos de red neuronal |
| Parámetros totales | No disponible: no es un modelo de IA |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible: depende del modelo DeepSeek invocado vía API, que el repositorio no especifica |
| Tipos de cuantización | No aplica |
| Idiomas soportados | No disponible (la model card está redactada en inglés; no se documenta la localización de la interfaz) |
| Licencia | No disponible (no se declara licencia en la información proporcionada) |
| Formato de pesos | No aplica: el repositorio contiene código Python, plantillas HTML/Jinja2, CSS, JavaScript y ficheros JSON |
| Framework web | Flask 2.3 |
| Motor de generación | API de DeepSeek (compatible con OpenAI), invocada desde `generator/ai_generator.py` |
| Librerías de documentos | python-pptx (PPTX), openpyxl (XLSX), python-docx (DOCX), reportlab (PDF), Pillow (miniaturas) |
| Pasarela de pago | Stripe Checkout (claves `pk_test_...` / `sk_test_...`; modo demo sin claves) |
| Persistencia | Ficheros JSON (`products.json`, `orders.json`); sin base de datos |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-17 |
| Última actualización (metadatos) | 2026-02-20 |

## Arquitectura y entrenamiento

El repositorio implementa una aplicación monolítica Flask con tres capas diferenciadas: `app.py` concentra rutas, autenticación de administrador y la lógica de Stripe; el paquete `generator/` separa la generación de contenido (`ai_generator.py`, que llama a la API de DeepSeek) de la creación física de ficheros (`file_creator.py`, que usa python-pptx, openpyxl, python-docx y reportlab); y el directorio `templates/` contiene las vistas Jinja2 (escaparate con filtro y búsqueda, ficha de producto, carrito, página de descarga posterior al pago y panel de administración). El estado se guarda en dos ficheros JSON auto-gestionados, y los binarios generados se depositan en `generated_templates/` junto con miniaturas en `static/thumbnails/`.

No existe entrenamiento ni ajuste fino: toda la capacidad generativa procede del proveedor externo DeepSeek. El flujo documentado es que el administrador elige tipo de plantilla, cantidad y precio, y el sistema encadena cuatro pasos —brainstorming de ideas, generación de contenido estructurado (diapositivas, filas, secciones), creación de los ficheros descargables y generación de la miniatura— antes de publicar automáticamente los productos en el catálogo. La model card cifra ese ciclo en 30–90 segundos. El proyecto incluye `seed_demo.py` para poblar la tienda sin claves de API y `generate_defaults.py` para crear una miniatura de relleno, lo que permite evaluar la aplicación sin coste ni dependencias externas.

## Capacidades

- Generación automática de contenido para plantillas a partir de la API de DeepSeek: ideas de producto, estructura de diapositivas, filas de hoja de cálculo y secciones de documento.
- Creación de ficheros descargables reales en cuatro formatos: PPTX, XLSX, DOCX y PDF.
- Generación de miniaturas de producto con Pillow y publicación automática en el catálogo.
- Escaparate con filtro y búsqueda, ficha de producto, carrito basado en sesión y flujo de descarga posterior al pago.
- Cobro mediante Stripe Checkout, con modo demo que registra el pedido y sirve los enlaces de descarga sin pasarela.
- Panel de administración protegido por contraseña con formulario de generación, vista de productos e historial de pedidos.
- API JSON de catálogo en `/api/products` para integraciones externas.
- Población de datos de demostración sin claves de API mediante `seed_demo.py`.
- No incluye: razonamiento multi-paso propio, tool calling nativo, agentes, visión, audio ni modo de pensamiento. Cualquier capacidad de ese tipo dependería del modelo DeepSeek subyacente, no del repositorio.

## Casos de uso

- Prototipo de tienda de productos digitales: partiendo de `seed_demo.py` se puede levantar un escaparate funcional con carrito y checkout en minutos, y sustituir los productos de demostración por generaciones reales cuando se configure la clave de DeepSeek.
- Pipeline interno de generación documental: el par `ai_generator.py` + `file_creator.py` es reutilizable como base para producir plantillas corporativas homogéneas (actas, presupuestos, informes) sin pasar por la tienda.
- Material de formación corporativa: generación por lotes de presentaciones de onboarding y hojas de seguimiento en PPTX y XLSX, con publicación directa en un catálogo interno protegido por contraseña de administrador.
- Base docente para cursos de Flask e integración de LLM: el código muestra de forma explícita la separación entre capa de IA, capa de creación de ficheros y capa web, con estructura de directorios documentada.
- Referencia de integración de Stripe Checkout: el flujo `/cart` → `/checkout` → `/success` → `/download/<id>` sirve como ejemplo mínimo de cobro con claves de test y tarjeta `4242 4242 4242 4242`.
- Semilla de SaaS vertical: el proyecto se puede especializar en un nicho (consultoría, educación, administración pública) cambiando el prompt de generación y las plantillas HTML, sin tocar la lógica de pago.
- Automatización de entregables para freelancers: generación de un paquete de plantillas bajo demanda y entrega mediante enlaces de descarga registrados en `orders.json`.
- Integración con sistemas externos: el endpoint `/api/products` permite que un CRM o una web corporativa consuman el catálogo sin acoplarse a la interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no evalúa calidad de las plantillas generadas ni incluye métricas de ningún tipo. El único dato de rendimiento declarado por el autor es el tiempo de generación de un lote: 30–90 segundos, dependiente de la latencia de la API de DeepSeek y del número de plantillas solicitado.

## Requisitos de hardware

- GPU: no se requiere ninguna. La inferencia ocurre en la infraestructura de DeepSeek; la aplicación solo hace peticiones HTTP.
- CPU y RAM: no documentados. El consumo vendrá determinado por el servidor Flask y por las librerías de generación de documentos (python-pptx, openpyxl, python-docx, reportlab, Pillow) al construir los ficheros.
- Almacenamiento: los ficheros generados se acumulan en `generated_templates/` y las miniaturas en `static/thumbnails/`; no se documenta política de retención ni límite.
- Sistema operativo y versión de Python: no disponibles. La instalación se realiza con `pip install -r requirements.txt` sobre un entorno con `.env` configurado.
- Despliegue: el repositorio solo documenta el servidor de desarrollo integrado (`python app.py`, puerto 5000). No se incluyen Dockerfile, configuración de gunicorn/uWSGI, ni manifiestos de despliegue. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir.
- Dependencias de red obligatorias en producción: API de DeepSeek (generación) y Stripe (cobro). Sin claves de Stripe, el checkout funciona en modo demo.
- Latencia y throughput: solo se declara el rango de 30–90 segundos por generación. No hay datos de concurrencia, peticiones por segundo ni comportamiento bajo carga.
- Base de datos: no se usa; el autor recomienda migrar a SQLite o PostgreSQL para producción.

## Comparativa con modelos similares

No hay modelos comparables en la información disponible, porque el artefacto no es un modelo. A modo de referencia, se compara con enfoques alternativos para el mismo problema (generar y vender plantillas de documentos):

| Alternativa | Enfoque | Generación con IA | Pago integrado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TemplateHub (este repositorio) | Aplicación Flask completa con catálogo, carrito y panel de administración | Sí, vía API de DeepSeek | Sí, Stripe Checkout | No disponible | Pública en HuggingFace, 0 descargas |
| Script propio con python-pptx / openpyxl | Automatización de documentos sin capa web | No | No | Depende de las librerías | Requiere desarrollo propio |
| Uso directo del SDK de DeepSeek | Llamada a la API sin empaquetar | Sí | No | Depende del proveedor | Inmediata, sin catálogo ni entrega |
| Plataformas SaaS de plantillas | Producto cerrado con editor y mercado | Parcial, según proveedor | Sí | Propietaria | Comercial, sujeta a suscripción |

## Limitaciones y advertencias

- No se declara licencia en el repositorio: no hay base legal explícita para uso comercial, redistribución o modificación. Es el principal riesgo antes de reutilizarlo en producción.
- El proyecto no es un modelo: cualquier expectativa de pesos, cuantizaciones, contexto o benchmarks queda fuera de lugar.
- Dependencia crítica de un proveedor externo: sin clave de API de DeepSeek no hay generación; los costes por token y las condiciones de uso del proveedor recaen sobre quien despliega.
- Persistencia frágil: catálogo y pedidos se guardan en ficheros JSON sin bloqueo ni transacciones, lo que puede corromper datos con escrituras concurrentes. El propio autor recomienda migrar a SQLite o PostgreSQL.
- Descargas sin verificación: la model card advierte que los enlaces de `/download/<id>` son de confianza implícita ("honour-system") y deben protegerse con verificación de pedido en producción.
- Credenciales por defecto: `ADMIN_PASSWORD` vale `admin123` si no se cambia en `.env`; el autor pide modificarla y establecer un `FLASK_SECRET_KEY` fuerte. No se documentan protección CSRF, limitación de intentos de login ni gestión de usuarios.
- Sin cuentas de usuario: no hay registro, historial de compras por cliente ni recuperación de acceso.
- Riesgo de contenido inadecuado o alucinado en las plantillas: el texto generado procede de un LLM sin revisión humana obligatoria antes de publicarse en el catálogo.
- Metadatos incoherentes: la fecha de creación (2026-10-17) es posterior a la de actualización (2026-02-20), lo que sugiere un error de registro y reduce la fiabilidad de las marcas temporales.
- Ausencia total de validación externa: 0 descargas y 0 likes, sin tests automatizados documentados ni resultados de benchmarks.
- Internacionalización no documentada: no se especifica si la interfaz o las plantillas generadas admiten otro idioma que el inglés.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron foros y sitios sin relación con el proyecto, por lo que no aportan información adicional verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/TemplateHub-AI-Powered-Template-Marketplace
- No se han encontrado en la búsqueda web papers, blogs, repositorios auxiliares ni demos relacionados con este proyecto; los resultados obtenidos eran foros y sitios sin relación y se han descartado.
