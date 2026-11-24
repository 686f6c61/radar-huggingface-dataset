# SUNSUNSASASA/gmgn-bullx-photon-copytrade-bot-v2

## Resumen

El repositorio `SUNSUNSASASA/gmgn-bullx-photon-copytrade-bot-v2` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 distribuido como archivo ZIP protegido con contraseña. La model card describe un supuesto bot de copytrading para plataformas de criptomonedas (GMGN, BullX, Photon) con módulos de paper trading, motor de bundles Jito/MEV, bóveda local de claves AES-256 y filtro de honeypots. No existe ningún artefacto de pesos neuronales, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado.

El contenido del README presenta inconsistencias graves que apuntan a un artefacto malicioso o de spam: el enlace de descarga apunta a un repositorio de GitHub ajeno (`cishii039/rob-run-cheat-mod-menu`) cuyo nombre sugiere un cheat o mod menu, no un bot de trading; se solicita ejecutar un binario `.exe` como administrador y se instruye a desactivar Windows Defender/SmartScreen. Los badges de descargas (490K+) y valoración (99%) son plausibles como texto inventado, ya que el propio Hugging Face reporta 0 descargas y 0 likes.

Desde la perspectiva de evaluación de modelos, esta ficha no puede completarse con datos técnicos reales porque no hay modelo. Se documenta el artefacto tal como aparece para dejar constancia de su naturaleza y de los riesgos de seguridad asociados, siguiendo el principio de no inventar especificaciones inexistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; paquete ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, dataset de entrenamiento, proceso de RLHF/DPO ni innovación técnica de modelado que documentar. La model card describe módulos de software para un supuesto bot de trading: sandbox de paper trading con 9 hilos de trabajo, motor de bundles Jito/MEV con tip sizing dinámico, bóveda local de claves AES-256 con polling a 414 Hz, bundler de 20 wallets mediante Lookup Tables, take profit multinivel y filtro de honeypots con respuesta inferior a 12 ms. Estas cifras son afirmaciones del autor sin verificación independiente y no constituyen especificaciones de un modelo de IA.

El binario se distribuye como `rob-run-cheat-mod-menu-v1.2.2-win64.exe` dentro de un ZIP con contraseña `2026`, alojado en un repositorio de GitHub de terceros no relacionado con el autor declarado en Hugging Face. La discrepancia entre el nombre del proyecto (bot de copytrading) y el nombre del ejecutable (cheat/mod menu) es una señal de alarma clásica de malware disfrazado.

## Capacidades

- No se puede verificar ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling, porque no hay modelo.
- La model card atribuye al software capacidades de trading automatizado (paper trading, ejecución de bundles, gestión de claves, filtrado de tokens), pero no aporta evidencia técnica ni código fuente auditable.
- Soporte multilingüe declarado únicamente a nivel de metadatos (14 idiomas), sin artefactos lingüísticos asociados.
- No hay soporte de agentes, multi-step reasoning ni modo thinking, al no existir un LLM subyacente.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y no debe desplegarse en entornos de desarrollo o investigación.
- Auditoría de seguridad: investigadores pueden analizar el patrón de publicación (ZIP con contraseña, ejecutable como administrador, instrucciones para desactivar Defender, enlaces a repositorios ajenos) como ejemplo de campaña de distribución de malware en plataformas de modelos.
- Formación en higiene de cadena de suministro: sirve como caso de estudio de por qué no se deben ejecutar binarios de repositorios de modelos sin verificación de procedencia y firma.
- Monitorización de repositorios: equipos de MLOps pueden usar este tipo de entradas para calibrar filtros que detecten artefactos no-modelo en catálogos de Hugging Face.
- Denuncia y reporte a la plataforma: el caso justifica reportar el repositorio a Hugging Face por uso indebido del catálogo de modelos.
- No se identifican casos de uso legítimos de trading, generación de código ni atención al cliente, ya que no hay modelo que los soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (490K+ descargas, 99% de valoración, 414 Hz de polling, menos de 12 ms de respuesta) son afirmaciones del autor sin metodología ni verificación, y contradicen los datos objetivos de la plataforma (0 descargas, 0 likes).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos del artefacto distribuido: Windows x64 (Windows 11 mencionado), ejecución como administrador, 7-Zip o WinRAR para extraer el ZIP con contraseña `2026`.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna aplicable.
- Latencia y throughput: no disponibles; las cifras declaradas por el autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable porque el artefacto no es un modelo de lenguaje, visión ni multimodal. Cualquier comparación con LLM open source (Llama, Mistral, Qwen, DeepSeek) sería categóricamente incorrecta.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA: no genera texto, no razona y no procesa lenguaje; su uso como modelo en un pipeline fallará.
- Riesgo de seguridad alto: se instruye a ejecutar un `.exe` como administrador y a desactivar Windows Defender/SmartScreen, patrón típico de distribución de malware.
- Suplantación de identidad: el enlace de descarga apunta a un repositorio de GitHub (`cishii039/rob-run-cheat-mod-menu`) distinto del autor declarado (`RuyetuPe45` / `SUNSUNSASASA`), lo que impide verificar la cadena de custodia.
- Inconsistencia de nombres: el proyecto se presenta como bot de copytrading pero el binario se llama "cheat mod menu", señal de ingeniería social.
- Métricas infladas: los badges de descargas y valoración no coinciden con las métricas reales de Hugging Face (0 descargas, 0 likes).
- Licencia MIT declarada, pero sin código fuente ni pesos a los que aplicarla de forma verificable.
- Riesgo financiero: cualquier uso relacionado con trading de criptomonedas conlleva pérdida de capital; no hay evidencia de que el software funcione como se describe.
- Recomendación: no descargar, no extraer y no ejecutar el binario; reportar el repositorio a Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SUNSUNSASASA/gmgn-bullx-photon-copytrade-bot-v2
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/RuyetuPe45/gmgn-bullx-photon-copytrade-bot-v2
- No se han encontrado papers, blogs técnicos, demos ni repositorios oficiales del modelo en la información disponible.
