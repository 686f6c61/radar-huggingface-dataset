# vuxdepzai/bybit-binance-perp-copytrade-bot-v3

## Resumen

`vuxdepzai/bybit-binance-perp-copytrade-bot-v3` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un supuesto ejecutable portable para Windows (x64) presentado como bot de copytrading de futuros perpetuos para Bybit y Binance. El artefacto distribuido es un archivo ZIP de 4,8 MB con contraseña, acompañado de un ejecutable denominado `rob-run-cheat-mod-menu-v1.2.2-win64.exe`, que se promociona mediante una model card construida con insignias, tablas de características y preguntas frecuentes.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. La etiqueta `pipeline` figura como no disponible y los tags declarados (`windows`, `windows-11`, `x64`, `portable`) corresponden a un binario, no a un modelo. Por tanto, no existe arquitectura transformer, parámetros, contexto ni datos de entrenamiento que describir.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para dejar constancia de que el artefacto no debe evaluarse como modelo y de que su patrón de distribución (ZIP con contraseña, ejecutable como administrador, enlaces a repositorios de terceros ajenos al autor declarado, temática financiera) coincide con vectores habituales de malware. No se ha publicado información técnica verificable sobre el binario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio declara en su model card un ejecutable `rob-run-cheat-mod-menu-v1.2.2-win64.exe` (build `v4.5.3`, identificador `9F08FE`) destinado a Windows 10 22H2 y Windows 11 24H2 sobre procesadores Intel y AMD x64. La documentación menciona módulos internos como un «20-wallet LUT bundler», un «Jito & MEV bundle engine», un filtro «pre-buy honeypot», un sandbox de paper trading y un almacén local de claves AES-256.

Estas descripciones son afirmaciones de marketing de la model card, no especificaciones verificables: no se aporta código fuente, hash del binario, firma digital ni resultado de análisis. El binario se distribuye comprimido con contraseña (`2026`) y se indica ejecutarlo como administrador, lo que impide la inspección previa por parte de antivirus y de usuarios. No hay información sobre datos, metodología ni proceso de validación.

## Capacidades

- No se trata de un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en modelos.
- Las capacidades que declara la model card son funcionales de un supuesto bot de trading: copia de carteras («smart-money copytrade»), ejecución multi-wallet, simulación de paper trading y filtrado de tokens.
- Multilingüismo: los 14 idiomas listados son metadatos del repositorio, no capacidades lingüísticas de un modelo.
- No hay modo «thinking», visión, audio ni ninguna capacidad multimodal.

## Casos de uso

- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox sin red, máquina virtual desechable) para determinar su comportamiento real antes de cualquier uso.
- Documentación de riesgos en cadena de suministro: registrar el patrón de distribución (ZIP con contraseña, ejecutable como administrador, enlaces a repositorios de terceros) como ejemplo de artefacto sospechoso en Hugging Face.
- Formación en seguridad: usar el caso como ejercicio práctico de identificación de ingeniería social en fichas de repositorios (insignias de descargas y valoraciones no verificables).
- Investigación de malware: si se confirma actividad maliciosa, extraer indicadores de compromiso (URLs, hashes, dominios) para feeds de threat intelligence.
- Revisión de políticas de plataforma: evaluar si el repositorio cumple las condiciones de uso de Hugging Face para contenido no relacionado con modelos.
- Trazabilidad de abuso de marca: comprobar si se emplean nombres de exchanges (Bybit, Binance) sin autorización para dotar de credibilidad al artefacto.

No se recomienda ningún caso de uso operativo del binario en producción, y en particular ninguno que implique claves de API de exchanges o fondos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (por ejemplo, `99,7%` de consistencia, `< 10 ms` de respuesta, `363 Hz` de sondeo, `642K+` descargas, valoración `4,9/5`) son afirmaciones promocionales sin metodología ni evidencia, y no deben interpretarse como métricas verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados del artefacto: Windows 10 22H2 o Windows 11 24H2, arquitectura x64 (Intel o AMD), 4,8 MB de archivo comprimido y, según la model card, menos de 31 MB de RAM en ejecución. Estas cifras no son verificables.
- Latencia y throughput: no disponibles de forma fiable.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. A modo de contraste categórico:

| Criterio | Este repositorio | Modelo de lenguaje open source típico |
|---|---|---|
| Naturaleza | Binario Windows x64 | Pesos de red neuronal |
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Reproducibilidad | No verificable | Verificable con eval estándar |
| Licencia | MIT declarada | MIT, Apache 2.0, etc. |
| Riesgo de seguridad | Alto (ejecutable opaco con contraseña) | Bajo (artefacto de datos) |

## Limitaciones y advertencias

- No es un modelo de IA: carece de arquitectura, pesos, tokenizador y pipeline; cualquier evaluación como modelo es improcedente.
- Distribución opaca: ZIP protegido con contraseña y ejecutable que se pide lanzar como administrador, lo que dificulta el escaneo antimalware y concede privilegios elevados.
- Enlaces de descarga alojados en repositorios de GitHub de terceros (`cishii039`, `sharonf35`) distintos del autor declarado (`vuxdepzai`), un patrón habitual en campañas de distribución de malware.
- Temática financiera de alto riesgo: un supuesto bot de copytrading requiere claves de API de exchanges; un binario malicioso podría exfiltrarlas y vaciar cuentas.
- Inconsistencia interna: el ejecutable se llama `rob-run-cheat-mod-menu`, nombre ajeno al dominio de trading, lo que sugiere reutilización de plantillas o suplantación.
- Métricas de la model card (descargas, valoración, tiempos de respuesta) no verificables y probablemente fabricadas.
- Licencia MIT declarada, pero sin código fuente ni aviso de copyright verificable; la licencia no aporta garantía alguna sobre el binario.
- Riesgo de alucinación: no aplica como modelo; el riesgo equivalente es el engaño deliberado en la documentación.
- Recomendación: no ejecutar el binario en equipos personales ni corporativos, no introducir claves de API de exchanges y reportar el repositorio a Hugging Face si se confirma contenido malicioso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vuxdepzai/bybit-binance-perp-copytrade-bot-v3
- Enlace de descarga citado en la model card (repositorio de terceros): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Enlace de releases citado en la model card (otro repositorio de terceros): https://github.com/sharonf35/bybit-binance-perp-copytrade-bot-v3/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
