# sushan98/opportunity-hunter-ai-model

## Resumen

Opportunity Hunter AI v2.0.0 es una plataforma de descubrimiento autónomo de oportunidades de negocio empaquetada como aplicación FastAPI y publicada en Hugging Face bajo el identificador `sushan98/opportunity-hunter-ai-model`. No se trata de un modelo de pesos abiertos, sino de un sistema agéntico completo: recopila señales de mercado en vivo, extrae oportunidades candidatas mediante un LLM, las valida contra evidencia verificable y las puntúa con un modelo determinista transparente, presentando los resultados en un panel SaaS multiinquilino.

Su principio de diseño central es que el modelo de lenguaje nunca decide la puntuación. El LLM devuelve únicamente entradas (siete métricas por categoría, evidencias con URL y marca temporal, y una lista de competidores), mientras que Python calcula el score con pesos fijos y publicados. La opinión del propio modelo sobre su salida se almacena en un campo separado `model_reported` y nunca se mezcla en el número final.

La relevancia actual del proyecto reside en su enfoque de honestidad epistémica: si la recolección en vivo no devuelve señales reales, la ejecución se detiene con el estado `insufficient_signals` en lugar de fabricar un mercado para llenar el panel. Es un modelo orientado a desarrolladores que quieran evaluar arquitecturas agénticas con separación estricta entre generación y decisión, con 57 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación agéntica sobre FastAPI con LLM multi-proveedor y scorer determinista en Python |
| Parametros totales | no disponible (no es un modelo de pesos propios; delega en proveedores LLM externos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del proveedor LLM configurado) |
| Tipos de cuantizacion | no disponible (no aplica; no distribuye pesos) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (no distribuye pesos; se despliega como aplicación Python) |

## Arquitectura y entrenamiento

El sistema no entrena un modelo propio. Se compone de un backend FastAPI con un router REST versionado (`/api/v1`), un panel HTML servido en la raíz, un motor de descubrimiento que orquesta herramientas de búsqueda y transporte LLM, y un scorer determinista implementado en Python. La capa LLM es multi-proveedor e intercambiable; funciona sin ninguna clave de pago si se ejecuta Ollama en local. La configuración se gestiona mediante variables de entorno (`.env`) con claves por proveedor, `JWT_SECRET` y `ENCRYPTION_KEY`.

El modelo de puntuación v2.0.0 asigna pesos fijos a siete categorías: demanda de mercado (0,20), potencial de beneficio (0,20), nivel de competencia (0,15), crecimiento de mercado (0,15), dolor del cliente (0,15), viabilidad de ejecución (0,10) y confianza en los datos (0,05), sumando 1,00. La confianza se deriva de la calidad de la evidencia y la cobertura de competidores, y se limita a 0,45 cuando no hay hechos verificables. El nivel de riesgo se calcula a partir de disparadores concretos: saturación, monetización débil, datos sin fuente y complejidad de construcción. Cada puntuación incluye valores por categoría, contribuciones ponderadas, advertencias, notas de riesgo y una explicación legible para auditoría.

En cuanto a validación, el repositorio incluye 121 tests (unitarios, de integración, de migración y de seguridad) que se ejecutan completamente offline mediante dobles de prueba para transportes LLM, herramientas de búsqueda y motor de descubrimiento. La pista de calidad LLM se omite, no se simula, cuando no hay proveedor configurado.

## Capacidades

- Descubrimiento autónomo de oportunidades de negocio a partir de señales de mercado en vivo.
- Extracción de candidatos mediante LLM con evidencias que incluyen URL y marca temporal de recuperación.
- Puntuación determinista y auditable con siete categorías ponderadas y explicación por categoría.
- Degradación explícita a hipótesis de cualquier hecho sin URL ni marca temporal antes de influir en la confianza.
- Detención controlada con estado `insufficient_signals` cuando no hay señales reales.
- Panel SaaS multiinquilino con temas claro/oscuro, filtros, gráficos, desglose por oportunidad y exportación.
- API REST versionada con autenticación por token bearer, paginación y aislamiento por `org_id`.
- Modos de ejecución CLI: panel + API, solo API, agente interactivo en terminal, daemon con escaneos programados, escaneo puntual por categoría e informe de inteligencia.
- Soporte multi-proveedor LLM y funcionamiento sin claves de pago mediante Ollama local.
- Endpoints de salud `/healthz` y `/readyz` con razones por comprobación.
- Compatibilidad con las rutas REST originales de v1 en `/legacy`.

## Casos de uso

- Investigación de mercado automatizada: el motor recopila señales en vivo y extrae candidatos con evidencias trazables, lo que permite a un equipo de producto revisar oportunidades con URL y fecha en lugar de afirmaciones sin respaldo.
- Evaluación de ideas de negocio con criterios auditables: el scorer determinista devuelve valores por categoría y contribuciones ponderadas, de modo que un analista puede reproducir el cálculo y discutir los pesos en lugar de aceptar una caja negra.
- Plataforma SaaS multiinquilino para equipos de innovación: el registro crea organizaciones separadas y cada consulta se filtra por `org_id`, con lecturas entre inquilinos devolviendo 404, lo que facilita ofrecer la herramienta a varios clientes desde un mismo despliegue.
- Integración en pipelines de investigación vía API: el endpoint `POST /api/v1/research/run` admite ejecución síncrona o encolada en un worker, lo que permite lanzar ciclos de descubrimiento desde un cron o un orquestador externo.
- Vigilancia continua de sectores concretos: el modo `daemon` ejecuta escaneos programados y el comando `--scan ai` realiza un escaneo puntual por categoría, útil para monitorizar un vertical específico.
- Despliegue en entornos sin presupuesto de API: con Ollama en local el sistema funciona sin claves de pago, y `/readyz` indica exactamente qué dependencia falta, lo que simplifica la puesta en marcha en equipos pequeños.
- Evaluación de arquitecturas agénticas: los 121 tests offline y el arnés de evaluación (`agent.eval.harness`) sirven como referencia para quien diseñe sistemas donde el LLM no debe decidir la métrica final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se distribuyen pesos, por lo que no hay VRAM específica del proyecto; los requisitos dependen del proveedor LLM elegido.
- Con Ollama local, la VRAM necesaria vendrá determinada por el modelo que se cargue en Ollama, no por esta aplicación.
- Con proveedores en la nube, el servidor solo necesita ejecutar el backend FastAPI y la base de datos, sin GPU dedicada.
- GPU recomendadas: no disponible para el componente de aplicación; para el LLM subyacente, no disponible.
- Despliegue documentado en `DEPLOYMENT.md`: Docker y Docker Compose, unidad systemd, proxy inverso, migraciones, copias de seguridad, monitorización y escalado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Opportunity Hunter AI v2.0.0 | Aplicación agéntica FastAPI | no aplica | depende del proveedor | MIT | Scorer determinista separado del LLM |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre proyectos comparables en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo de pesos: no puede descargarse ni ejecutarse como un transformer; requiere desplegar la aplicación y configurar al menos un proveedor LLM.
- Solo declara soporte de inglés (`en`); no se documentan capacidades multilingües.
- La calidad de las oportunidades extraídas depende del proveedor LLM y de las herramientas de búsqueda configuradas; el scorer determinista no corrige entradas pobres, solo las penaliza vía confianza y riesgo.
- Riesgo de alucinación mitigado, no eliminado: los hechos sin URL ni marca temporal se degradan a hipótesis, pero el LLM sigue generando el contenido inicial.
- La pista de evaluación de calidad LLM se omite cuando no hay proveedor, por lo que no hay métricas de calidad publicadas.
- Aviso de seguridad del propio autor: existen credenciales que fueron comprometidas en la v1 y deben rotarse; consultar `SECURITY.md`.
- Las claves de proveedor por organización se cifran en reposo con Fernet y derivación PBKDF2, pero la seguridad operativa recae en el despliegue del usuario.
- Licencia MIT permite uso comercial, pero no se ofrece garantía ni soporte; el proyecto tiene 57 descargas y 1 like, lo que indica una adopción muy temprana.
- Los límites de tasa por IP y la paginación máxima de 200 filas pueden requerir ajuste para cargas de producción intensivas.

## Enlaces

- Hugging Face: https://huggingface.co/sushan98/opportunity-hunter-ai-model
- Documentación de arquitectura: `ARCHITECTURE.md` (en el repositorio)
- Informe de actualización: `docs/UPGRADE-REPORT.md` (en el repositorio)
- Referencia de API: `docs/API.md` (en el repositorio)
- Política de seguridad: `SECURITY.md` (en el repositorio)
- Guía de despliegue: `DEPLOYMENT.md` (en el repositorio)
- Ollama: https://ollama.com
- Documentación interactiva OpenAPI: `/docs` en la instancia local
